import { createClient } from "@/lib/supabase/server";
import { likePattern } from "@/lib/text";
import { peopleByIds, type Person } from "@/features/community/people";

export type CatalogueHit = { kind: "artist" | "release" | "track"; id: string; slug: string; name: string; detail: string | null };

/** Exact name first, then names that start with the query, then the rest, alphabetically. */
export function rankByName<T>(items: T[], q: string, name: (t: T) => string): T[] {
  const needle = q.trim().toLowerCase();
  const score = (t: T) => {
    const n = name(t).toLowerCase();
    if (n === needle) return 0;
    if (n.startsWith(needle)) return 1;
    if (n.split(/\s+/).some((w) => w.startsWith(needle))) return 2;
    return 3;
  };
  return [...items].sort((a, b) => score(a) - score(b) || name(a).localeCompare(name(b)));
}

export function cleanQuery(raw: string | string[] | undefined): string {
  const q = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  return q.replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function searchCatalogue(q: string, limit = 8): Promise<{ artists: CatalogueHit[]; releases: CatalogueHit[]; tracks: CatalogueHit[] }> {
  if (q.length < 2) return { artists: [], releases: [], tracks: [] };
  const supabase = await createClient();
  const pattern = likePattern(q);
  const [{ data: artists }, { data: releases }, { data: tracks }] = await Promise.all([
    supabase.from("artists").select("id, slug, name, genres").ilike("name", pattern).limit(40),
    supabase.from("releases").select("id, slug, title, artist_id, kind").ilike("title", pattern).limit(40),
    supabase.from("tracks").select("id, slug, title, artist_id").ilike("title", pattern).limit(40),
  ]);
  const artistIds = [...(releases ?? []), ...(tracks ?? [])].map((r) => r.artist_id);
  const { data: names } = artistIds.length ? await supabase.from("artists").select("id, name").in("id", Array.from(new Set(artistIds))) : { data: [] };
  const nameOf = new Map((names ?? []).map((a) => [a.id, a.name as string]));
  return {
    artists: rankByName(artists ?? [], q, (a) => a.name)
      .slice(0, limit)
      .map((a) => ({ kind: "artist", id: a.id, slug: a.slug, name: a.name, detail: (a.genres ?? []).slice(0, 2).join(", ") || null })),
    releases: rankByName(releases ?? [], q, (r) => r.title)
      .slice(0, limit)
      .map((r) => ({ kind: "release", id: r.id, slug: r.slug, name: r.title, detail: nameOf.get(r.artist_id) ?? null })),
    tracks: rankByName(tracks ?? [], q, (t) => t.title)
      .slice(0, limit)
      .map((t) => ({ kind: "track", id: t.id, slug: t.slug, name: t.title, detail: nameOf.get(t.artist_id) ?? null })),
  };
}

export async function searchCommunity(q: string, limit = 6) {
  if (q.length < 2) return { people: [] as Person[], discussions: [], polls: [], rankings: [] };
  const supabase = await createClient();
  const pattern = likePattern(q);
  const [{ data: people }, { data: discussions }, { data: polls }, { data: rankings }] = await Promise.all([
    supabase.from("profiles").select("id").or(`handle.ilike."${pattern}",display_name.ilike."${pattern}"`).limit(limit),
    supabase.from("discussions").select("id, title, reply_count, author_id").eq("is_removed", false).ilike("title", pattern).order("last_activity_at", { ascending: false }).limit(limit),
    supabase.from("polls").select("id, question, vote_count").eq("is_removed", false).ilike("question", pattern).order("created_at", { ascending: false }).limit(limit),
    supabase.from("rankings").select("id, title, item_count, author_id").eq("is_public", true).eq("is_removed", false).ilike("title", pattern).order("updated_at", { ascending: false }).limit(limit),
  ]);
  const map = await peopleByIds((people ?? []).map((p) => p.id));
  return {
    people: rankByName(Array.from(map.values()), q, (p) => p.display_name),
    discussions: (discussions ?? []) as { id: string; title: string; reply_count: number }[],
    polls: (polls ?? []) as { id: string; question: string; vote_count: number }[],
    rankings: (rankings ?? []) as { id: string; title: string; item_count: number }[],
  };
}
