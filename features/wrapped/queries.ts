import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { artVariant } from "@/features/catalogue/slug";
import type { Period } from "./periods";

type Raw = {
  scores: number;
  written: number;
  average: number | null;
  top: { rating: number; artist_id: string | null; release_id: string | null; track_id: string | null }[];
  artists: { artist_id: string; n: number }[];
  genres: string[];
  agree_home: number | null;
  agree_diaspora: number | null;
  early_ears: number;
};
export type WrappedPick = { rating: number; title: string; by: string | null; href: string; art: number };
export type Wrapped = Omit<Raw, "top" | "artists"> & {
  person: { id: string; handle: string; display_name: string; avatar_url: string | null };
  top: WrappedPick[];
  artists: { name: string; slug: string; n: number }[];
};

/** A fan's Wrapped for a month or a year, with names filled in. */
export const getWrapped = cache(async (handle: string, period: Period): Promise<Wrapped | null> => {
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) return null;
  const supabase = await createClient();
  const { data: person } = await supabase.from("profiles").select("id, handle, display_name, avatar_url").eq("handle", handle).maybeSingle();
  if (!person) return null;
  const { data, error } = await supabase.rpc("wrapped", { p_user: person.id, p_from: period.from, p_to: period.to });
  if (error || !data) {
    if (error) console.error("wrapped failed", error.code, error.message);
    return null;
  }
  const raw = data as Raw;
  const trackIds = raw.top.map((t) => t.track_id).filter((v): v is string => !!v);
  const releaseIds = raw.top.map((t) => t.release_id).filter((v): v is string => !!v);
  const artistIds = [...raw.top.map((t) => t.artist_id), ...raw.artists.map((a) => a.artist_id)].filter((v): v is string => !!v);
  const [{ data: tr }, { data: rel }] = await Promise.all([
    trackIds.length ? supabase.from("tracks").select("id, slug, title, artist_id").in("id", trackIds) : Promise.resolve({ data: [] }),
    releaseIds.length ? supabase.from("releases").select("id, slug, title, artist_id").in("id", releaseIds) : Promise.resolve({ data: [] }),
  ]);
  const tracks = (tr ?? []) as { id: string; slug: string; title: string; artist_id: string }[];
  const releases = (rel ?? []) as { id: string; slug: string; title: string; artist_id: string }[];
  const allArtists = Array.from(new Set([...artistIds, ...tracks.map((t) => t.artist_id), ...releases.map((r) => r.artist_id)]));
  const { data: ar } = allArtists.length ? await supabase.from("artists").select("id, slug, name").in("id", allArtists) : { data: [] };
  const artists = new Map(((ar ?? []) as { id: string; slug: string; name: string }[]).map((a) => [a.id, a]));
  const trackBy = new Map(tracks.map((t) => [t.id, t]));
  const releaseBy = new Map(releases.map((r) => [r.id, r]));

  const top: WrappedPick[] = raw.top.flatMap((t) => {
    if (t.track_id && trackBy.get(t.track_id)) {
      const x = trackBy.get(t.track_id)!;
      return [{ rating: t.rating, title: x.title, by: artists.get(x.artist_id)?.name ?? null, href: `/song/${x.slug}`, art: artVariant(x.slug) }];
    }
    if (t.release_id && releaseBy.get(t.release_id)) {
      const x = releaseBy.get(t.release_id)!;
      return [{ rating: t.rating, title: x.title, by: artists.get(x.artist_id)?.name ?? null, href: `/album/${x.slug}`, art: artVariant(x.slug) }];
    }
    if (t.artist_id && artists.get(t.artist_id)) {
      const x = artists.get(t.artist_id)!;
      return [{ rating: t.rating, title: x.name, by: null, href: `/artist/${x.slug}`, art: artVariant(x.slug) }];
    }
    return [];
  });
  return {
    ...raw,
    average: raw.average === null ? null : Number(raw.average),
    person: person as Wrapped["person"],
    top,
    artists: raw.artists.flatMap((a) => (artists.get(a.artist_id) ? [{ name: artists.get(a.artist_id)!.name, slug: artists.get(a.artist_id)!.slug, n: a.n }] : [])),
  };
});
