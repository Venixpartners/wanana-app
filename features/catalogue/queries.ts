import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Artist = {
  id: string;
  slug: string;
  name: string;
  country_code: string | null;
  genres: string[];
  summary: string | null;
  image_url: string | null;
  links: Record<string, string>;
  external_ids: Record<string, string>;
  is_published: boolean;
};
export type Release = {
  id: string;
  slug: string;
  title: string;
  artist_id: string;
  kind: "album" | "ep" | "single" | "mixtape";
  release_date: string | null;
  label: string | null;
  upc: string | null;
  cover_url: string | null;
  links: Record<string, string>;
  is_published: boolean;
};
export type Track = {
  id: string;
  slug: string;
  title: string;
  artist_id: string;
  release_id: string | null;
  track_number: number | null;
  isrc: string | null;
  duration_seconds: number | null;
  release_date: string | null;
  links: Record<string, string>;
  is_published: boolean;
};
export type ArtistRef = Pick<Artist, "id" | "slug" | "name">;

const ARTIST = "id, slug, name, country_code, genres, summary, image_url, links, external_ids, is_published";
const RELEASE = "id, slug, title, artist_id, kind, release_date, label, upc, cover_url, links, is_published";
const TRACK = "id, slug, title, artist_id, release_id, track_number, isrc, duration_seconds, release_date, links, is_published";

async function artistsByIds(ids: string[]): Promise<Map<string, ArtistRef>> {
  const unique = Array.from(new Set(ids));
  if (!unique.length) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from("artists").select("id, slug, name").in("id", unique);
  return new Map((data ?? []).map((a) => [a.id, a as ArtistRef]));
}

/** Featured artists for each track id. */
async function featuresFor(trackIds: string[]): Promise<Map<string, ArtistRef[]>> {
  const out = new Map<string, ArtistRef[]>();
  if (!trackIds.length) return out;
  const supabase = await createClient();
  const { data } = await supabase.from("track_artists").select("track_id, artist_id").in("track_id", trackIds);
  const refs = await artistsByIds((data ?? []).map((r) => r.artist_id));
  for (const r of data ?? []) {
    const a = refs.get(r.artist_id);
    if (a) out.set(r.track_id, [...(out.get(r.track_id) ?? []), a]);
  }
  return out;
}

export const getArtistPage = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: artist } = await supabase.from("artists").select(ARTIST).eq("slug", slug).maybeSingle<Artist>();
  if (!artist) return null;

  const [{ data: releases }, { data: tracks }, { data: featuredRows }] = await Promise.all([
    supabase.from("releases").select(RELEASE).eq("artist_id", artist.id).order("release_date", { ascending: false, nullsFirst: false }).returns<Release[]>(),
    supabase.from("tracks").select(TRACK).eq("artist_id", artist.id).order("release_date", { ascending: false, nullsFirst: false }).limit(20).returns<Track[]>(),
    supabase.from("track_artists").select("track_id").eq("artist_id", artist.id).limit(50),
  ]);

  const featuredIds = (featuredRows ?? []).map((r) => r.track_id);
  const { data: featuredOn } = featuredIds.length
    ? await supabase.from("tracks").select(TRACK).in("id", featuredIds).order("release_date", { ascending: false, nullsFirst: false }).returns<Track[]>()
    : { data: [] as Track[] };
  const mainArtists = await artistsByIds((featuredOn ?? []).map((t) => t.artist_id));
  const features = await featuresFor((tracks ?? []).map((t) => t.id));

  return { artist, releases: releases ?? [], tracks: tracks ?? [], features, featuredOn: featuredOn ?? [], mainArtists };
});

export const getReleasePage = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: release } = await supabase.from("releases").select(RELEASE).eq("slug", slug).maybeSingle<Release>();
  if (!release) return null;

  const [{ data: artist }, { data: tracks }, { data: more }] = await Promise.all([
    supabase.from("artists").select(ARTIST).eq("id", release.artist_id).maybeSingle<Artist>(),
    supabase.from("tracks").select(TRACK).eq("release_id", release.id).order("track_number", { ascending: true, nullsFirst: false }).returns<Track[]>(),
    supabase.from("releases").select(RELEASE).eq("artist_id", release.artist_id).neq("id", release.id).order("release_date", { ascending: false, nullsFirst: false }).limit(6).returns<Release[]>(),
  ]);
  if (!artist) return null;
  const features = await featuresFor((tracks ?? []).map((t) => t.id));
  return { release, artist, tracks: tracks ?? [], features, more: more ?? [] };
});

export const getTrackPage = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: track } = await supabase.from("tracks").select(TRACK).eq("slug", slug).maybeSingle<Track>();
  if (!track) return null;

  const [{ data: artist }, releaseRes, { data: more }] = await Promise.all([
    supabase.from("artists").select(ARTIST).eq("id", track.artist_id).maybeSingle<Artist>(),
    track.release_id
      ? supabase.from("releases").select(RELEASE).eq("id", track.release_id).maybeSingle<Release>()
      : Promise.resolve({ data: null as Release | null }),
    supabase.from("tracks").select(TRACK).eq("artist_id", track.artist_id).neq("id", track.id).order("release_date", { ascending: false, nullsFirst: false }).limit(6).returns<Track[]>(),
  ]);
  if (!artist) return null;
  const features = await featuresFor([track.id]);
  return { track, artist, release: releaseRes.data, featured: features.get(track.id) ?? [], more: more ?? [] };
});
