import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { artVariant } from "@/features/catalogue/slug";
import type { Release } from "@/features/catalogue/queries";

export type VerdictEntry = {
  position: number;
  release_id: string;
  pulse: number;
  ratings: number;
  average: number;
  home_pulse: number | null;
  diaspora_pulse: number | null;
  release?: { slug: string; title: string; kind: Release["kind"]; artist: string | null; art: number };
};

/** ISO date check for a Friday, such as 2026-10-30. */
export function isFriday(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.getUTCDay() === 5 && d.toISOString().slice(0, 10) === v;
}

/** The Friday of the weekend now being scored, in Lagos time, or null outside Friday to Sunday. */
export function liveFriday(now = new Date()) {
  const lagos = new Date(now.getTime() + 60 * 60 * 1000);
  const day = lagos.getUTCDay();
  const back = day === 5 ? 0 : day === 6 ? 1 : day === 0 ? 2 : null;
  if (back === null) return null;
  lagos.setUTCDate(lagos.getUTCDate() - back);
  return lagos.toISOString().slice(0, 10);
}

export function verdictDateText(friday: string) {
  return new Date(`${friday}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

async function decorate(rows: Omit<VerdictEntry, "release">[]): Promise<VerdictEntry[]> {
  if (!rows.length) return [];
  const supabase = await createClient();
  const { data: rel } = await supabase.from("releases").select("id, slug, title, kind, artist_id").in("id", rows.map((r) => r.release_id));
  const releases = (rel ?? []) as { id: string; slug: string; title: string; kind: Release["kind"]; artist_id: string }[];
  const { data: artists } = await supabase.from("artists").select("id, name").in("id", Array.from(new Set(releases.map((r) => r.artist_id))));
  const name = new Map(((artists ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));
  const byId = new Map(releases.map((r) => [r.id, { slug: r.slug, title: r.title, kind: r.kind, artist: name.get(r.artist_id) ?? null, art: artVariant(r.slug) }]));
  return rows.map((r) => ({ ...r, average: Number(r.average), release: byId.get(r.release_id) }));
}

export const lastVerdictFriday = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("last_verdict_friday");
  if (error) console.error("last_verdict_friday failed", error.code, error.message);
  return (data as string | null) ?? null;
});

/** A week's verdict: the saved one when it exists, otherwise worked out live. */
export const getVerdict = cache(async (friday: string): Promise<{ entries: VerdictEntry[]; saved: boolean }> => {
  if (!isFriday(friday)) return { entries: [], saved: false };
  const supabase = await createClient();
  const { data: saved } = await supabase
    .from("verdict_entries")
    .select("position, release_id, pulse, ratings, average, home_pulse, diaspora_pulse")
    .eq("week_friday", friday)
    .order("position")
    .returns<Omit<VerdictEntry, "release">[]>();
  if (saved?.length) return { entries: await decorate(saved), saved: true };
  const { data, error } = await supabase.rpc("fan_verdict", { p_friday: friday });
  if (error) console.error("fan_verdict failed", error.code, error.message);
  const live = ((data ?? []) as (Omit<VerdictEntry, "release" | "position"> & { verdict_position: number })[]).map(({ verdict_position, ...r }) => ({ ...r, position: verdict_position }));
  return { entries: await decorate(live), saved: false };
});

/** Past weeks that have a saved verdict, newest first. */
export async function pastVerdicts(limit = 12): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("verdict_entries").select("week_friday").eq("position", 1).order("week_friday", { ascending: false }).limit(limit);
  return (data ?? []).map((r) => r.week_friday as string);
}
