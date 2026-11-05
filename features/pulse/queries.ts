import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SubjectKind } from "@/features/community/subjects";
import type { ArtistRef, Track } from "@/features/catalogue/queries";
import type { ChartName } from "./charts";

export type PulseRow = { audience: "all" | "home" | "diaspora"; ratings: number; average: number; pulse: number; ratings_7d: number; ratings_prev_7d: number };
export type Pulse = { all: PulseRow | null; home: PulseRow | null; diaspora: PulseRow | null };

/** Fan Pulse for an artist, release or song, with the home and diaspora split. */
export const fanPulse = cache(async (kind: SubjectKind, id: string): Promise<Pulse> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fan_pulse", { p_kind: kind, p_id: id });
  if (error) console.error("fan_pulse failed", error.code, error.message);
  const rows = ((data ?? []) as PulseRow[]).map((r) => ({ ...r, average: Number(r.average) }));
  const pick = (a: PulseRow["audience"]) => rows.find((r) => r.audience === a) ?? null;
  return { all: pick("all"), home: pick("home"), diaspora: pick("diaspora") };
});

type ChartRow = { chart_position: number; track_id: string; score: number; pulse: number; ratings: number; ratings_7d: number; last_position: number | null };
export type ChartEntry = Omit<ChartRow, "chart_position"> & { position: number; track: Pick<Track, "id" | "slug" | "title" | "release_id">; artist: ArtistRef | undefined; releaseSlug: string | null };

const TRACK_COLS = "id, slug, title, artist_id, release_id";

/** A live Wanana Chart with song, artist and release details. */
export const getChart = cache(async (chart: ChartName, limit = 20): Promise<ChartEntry[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("chart", { p_chart: chart, p_limit: limit });
  if (error) console.error("chart failed", chart, error.code, error.message);
  const rows = (data ?? []) as ChartRow[];
  if (!rows.length) return [];
  const { data: tracks } = await supabase.from("tracks").select(TRACK_COLS).in("id", rows.map((r) => r.track_id));
  const byId = new Map((tracks ?? []).map((t) => [t.id as string, t as Pick<Track, "id" | "slug" | "title" | "release_id" | "artist_id">]));
  const artistIds = Array.from(new Set((tracks ?? []).map((t) => t.artist_id as string)));
  const releaseIds = Array.from(new Set((tracks ?? []).map((t) => t.release_id as string | null).filter((v): v is string => !!v)));
  const [{ data: artists }, { data: releases }] = await Promise.all([
    artistIds.length ? supabase.from("artists").select("id, slug, name").in("id", artistIds) : Promise.resolve({ data: [] as ArtistRef[] }),
    releaseIds.length ? supabase.from("releases").select("id, slug").in("id", releaseIds) : Promise.resolve({ data: [] as { id: string; slug: string }[] }),
  ]);
  const artistById = new Map((artists ?? []).map((a) => [a.id, a as ArtistRef]));
  const releaseSlug = new Map((releases ?? []).map((r) => [r.id, r.slug as string]));
  return rows.flatMap((r) => {
    const t = byId.get(r.track_id);
    if (!t) return [];
    const { chart_position, ...rest } = r;
    return [{ ...rest, position: chart_position, score: Number(r.score), track: t, artist: artistById.get(t.artist_id), releaseSlug: t.release_id ? (releaseSlug.get(t.release_id) ?? null) : null }];
  });
});

export type EarlyEar = { track_id: string; rating: number; rated_at: string; reached_top10: string; track?: { slug: string; title: string; artist?: string } };

/** Songs this fan backed before they reached the Fan Chart Top 10. */
export async function earlyEars(userId: string): Promise<EarlyEar[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("early_ears", { p_user: userId });
  if (error) console.error("early_ears failed", error.code, error.message);
  const rows = (data ?? []) as EarlyEar[];
  if (!rows.length) return [];
  const { data: tracks } = await supabase.from("tracks").select("id, slug, title, artist_id").in("id", rows.map((r) => r.track_id));
  const { data: artists } = await supabase.from("artists").select("id, name").in("id", Array.from(new Set((tracks ?? []).map((t) => t.artist_id))));
  const artistName = new Map((artists ?? []).map((a) => [a.id, a.name as string]));
  const trackById = new Map((tracks ?? []).map((t) => [t.id, { slug: t.slug as string, title: t.title as string, artist: artistName.get(t.artist_id) }]));
  return rows.map((r) => ({ ...r, track: trackById.get(r.track_id) }));
}
