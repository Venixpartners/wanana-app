import { createClient } from "@/lib/supabase/server";
import { peopleByIds, type Person } from "@/features/community/people";
import { resolveSubjects, subjectFor, type Subject } from "@/features/community/subjects";

export type RankingRow = { id: string; author_id: string; title: string; description: string | null; is_public: boolean; item_count: number; created_at: string; updated_at: string };
export type RankingItemRow = { ranking_id: string; position: number; artist_id: string | null; release_id: string | null; track_id: string | null; note: string | null };

const COLS = "id, author_id, title, description, is_public, item_count, created_at, updated_at";

export async function listRankings(opts: { authorId?: string; includePrivate?: boolean; limit?: number } = {}) {
  const supabase = await createClient();
  let q = supabase.from("rankings").select(COLS).eq("is_removed", false);
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  if (!opts.includePrivate) q = q.eq("is_public", true);
  const { data } = await q.order("updated_at", { ascending: false }).limit(opts.limit ?? 24).returns<RankingRow[]>();
  const rows = data ?? [];
  const { data: firstItems } = rows.length
    ? await supabase.from("ranking_items").select("ranking_id, position, artist_id, release_id, track_id, note").in("ranking_id", rows.map((r) => r.id)).lte("position", 3).order("position").returns<RankingItemRow[]>()
    : { data: [] as RankingItemRow[] };
  const [people, subjects] = await Promise.all([peopleByIds(rows.map((r) => r.author_id)), resolveSubjects(firstItems ?? [])]);
  return rows.map((r) => ({
    ...r,
    author: people.get(r.author_id),
    preview: (firstItems ?? []).filter((i) => i.ranking_id === r.id).map((i) => subjectFor(subjects, i)).filter((s): s is Subject => !!s),
  }));
}

export async function getRanking(id: string) {
  const supabase = await createClient();
  const { data: ranking } = await supabase.from("rankings").select(COLS).eq("id", id).maybeSingle<RankingRow>();
  if (!ranking) return null;
  const { data: items } = await supabase
    .from("ranking_items")
    .select("ranking_id, position, artist_id, release_id, track_id, note")
    .eq("ranking_id", id)
    .order("position")
    .returns<RankingItemRow[]>();
  const [people, subjects] = await Promise.all([peopleByIds([ranking.author_id]), resolveSubjects(items ?? [])]);
  return {
    ranking,
    author: people.get(ranking.author_id) as Person | undefined,
    items: (items ?? []).map((i) => ({ ...i, subject: subjectFor(subjects, i) })),
  };
}
