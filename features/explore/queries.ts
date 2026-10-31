import { createClient } from "@/lib/supabase/server";
import type { ArtistRef, Release, Track } from "@/features/catalogue/queries";

export type Genre = { name: string; slug: string; artists: number };

export function genreSlug(name: string) {
  return name.trim().toLowerCase();
}

/** Every genre used on a published artist, most common first. */
export async function listGenres(limit = 24): Promise<Genre[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("artists").select("genres").eq("is_published", true).limit(5000);
  const counts = new Map<string, { name: string; n: number }>();
  for (const row of data ?? []) {
    for (const g of (row.genres as string[]) ?? []) {
      const key = genreSlug(g);
      if (!key) continue;
      const cur = counts.get(key);
      counts.set(key, { name: cur?.name ?? g.trim(), n: (cur?.n ?? 0) + 1 });
    }
  }
  return Array.from(counts.entries())
    .map(([slug, { name, n }]) => ({ slug, name, artists: n }))
    .sort((a, b) => b.artists - a.artists || a.name.localeCompare(b.name))
    .slice(0, limit);
}

async function artistNames(ids: string[]) {
  if (!ids.length) return new Map<string, ArtistRef>();
  const supabase = await createClient();
  const { data } = await supabase.from("artists").select("id, slug, name").in("id", Array.from(new Set(ids)));
  return new Map((data ?? []).map((a) => [a.id, a as ArtistRef]));
}

const RELEASE = "id, slug, title, artist_id, kind, release_date, label, upc, cover_url, links, is_published";
const TRACK = "id, slug, title, artist_id, release_id, track_number, isrc, duration_seconds, release_date, links, is_published";

export async function newReleases(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select(RELEASE)
    .eq("is_published", true)
    .order("release_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Release[]>();
  return data ?? [];
}

export async function newSongs(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase.from("tracks").select(TRACK).eq("is_published", true).order("created_at", { ascending: false }).limit(limit).returns<Track[]>();
  const tracks = data ?? [];
  return { tracks, artists: await artistNames(tracks.map((t) => t.artist_id)) };
}

export async function newArtists(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase.from("artists").select("id, slug, name, genres, country_code").eq("is_published", true).order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as { id: string; slug: string; name: string; genres: string[]; country_code: string | null }[];
}

/** Artists in a genre, matched without caring about capital letters. */
export async function genrePage(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("artists").select("id, slug, name, genres, country_code").eq("is_published", true).limit(5000);
  const artists = ((data ?? []) as { id: string; slug: string; name: string; genres: string[]; country_code: string | null }[])
    .filter((a) => (a.genres ?? []).some((g) => genreSlug(g) === slug))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!artists.length) return null;
  const name = artists[0].genres.find((g) => genreSlug(g) === slug) ?? slug;
  const { data: releases } = await supabase
    .from("releases")
    .select(RELEASE)
    .eq("is_published", true)
    .in("artist_id", artists.slice(0, 200).map((a) => a.id))
    .order("release_date", { ascending: false, nullsFirst: false })
    .limit(12)
    .returns<Release[]>();
  return { name, artists, releases: releases ?? [] };
}
