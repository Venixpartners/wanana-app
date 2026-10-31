import { createClient } from "@/lib/supabase/server";
import { peopleByIds, type Person } from "@/features/community/people";
import { resolveSubjects, subjectFor, type Subject, type SubjectColumns, type SubjectKind } from "@/features/community/subjects";
import { average } from "./schema";

export type ReviewRow = SubjectColumns & {
  id: string;
  author_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  audience: "home" | "diaspora" | null;
  helpful_count: number;
  comment_count: number;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
};
export type ReviewItem = ReviewRow & { author?: Person; subject: Subject | null };

const COLS = "id, author_id, artist_id, release_id, track_id, rating, title, body, audience, helpful_count, comment_count, is_removed, created_at, updated_at";

async function decorate(rows: ReviewRow[]): Promise<ReviewItem[]> {
  const [people, subjects] = await Promise.all([peopleByIds(rows.map((r) => r.author_id)), resolveSubjects(rows)]);
  return rows.map((r) => ({ ...r, author: people.get(r.author_id), subject: subjectFor(subjects, r) }));
}

export async function ratingSummary(subject: { kind: SubjectKind; id: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from("reviews").select("rating").eq(`${subject.kind}_id`, subject.id).eq("is_removed", false).limit(10000);
  const ratings = (data ?? []).map((r) => r.rating as number);
  return { average: average(ratings), count: ratings.length };
}

export async function listReviews(opts: { subject?: { kind: SubjectKind; id: string }; authorId?: string; sort?: "helpful" | "new"; writtenOnly?: boolean; limit?: number } = {}) {
  const supabase = await createClient();
  let q = supabase.from("reviews").select(COLS).eq("is_removed", false);
  if (opts.subject) q = q.eq(`${opts.subject.kind}_id`, opts.subject.id);
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  if (opts.writtenOnly ?? true) q = q.not("body", "is", null);
  q = opts.sort === "new" ? q.order("created_at", { ascending: false }) : q.order("helpful_count", { ascending: false }).order("created_at", { ascending: false });
  const { data } = await q.limit(opts.limit ?? 20).returns<ReviewRow[]>();
  return decorate(data ?? []);
}

export async function viewerReview(subject: { kind: SubjectKind; id: string }, viewerId: string | null) {
  if (!viewerId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("reviews").select(COLS).eq(`${subject.kind}_id`, subject.id).eq("author_id", viewerId).maybeSingle<ReviewRow>();
  return data;
}

export async function viewerHelpful(reviewIds: string[], viewerId: string | null): Promise<Set<string>> {
  if (!viewerId || !reviewIds.length) return new Set();
  const supabase = await createClient();
  const { data } = await supabase.from("review_helpful").select("review_id").eq("user_id", viewerId).in("review_id", reviewIds);
  return new Set((data ?? []).map((r) => r.review_id));
}

export async function getReview(id: string, viewerId: string | null) {
  const supabase = await createClient();
  const { data: row } = await supabase.from("reviews").select(COLS).eq("id", id).maybeSingle<ReviewRow>();
  if (!row) return null;
  const { data: comments } = await supabase
    .from("review_comments")
    .select("id, review_id, author_id, body, is_removed, created_at")
    .eq("review_id", id)
    .order("created_at", { ascending: true })
    .limit(300);
  const [[review], people, helpful] = await Promise.all([decorate([row]), peopleByIds((comments ?? []).map((c) => c.author_id)), viewerHelpful([id], viewerId)]);
  return {
    review,
    comments: (comments ?? []).map((c) => ({ ...(c as { id: string; author_id: string; body: string; is_removed: boolean; created_at: string }), author: people.get(c.author_id) })),
    viewerFoundHelpful: helpful.has(id),
  };
}

export async function countReviews(authorId: string) {
  const supabase = await createClient();
  const [all, written] = await Promise.all([
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("author_id", authorId),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("author_id", authorId).not("body", "is", null),
  ]);
  return { ratings: all.count ?? 0, reviews: written.count ?? 0 };
}
