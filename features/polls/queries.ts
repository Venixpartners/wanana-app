import { createClient } from "@/lib/supabase/server";
import { peopleByIds, type Person } from "@/features/community/people";
import { resolveSubjects, subjectFor, type Subject, type SubjectColumns, type SubjectKind } from "@/features/community/subjects";

export type PollOption = { id: string; poll_id: string; label: string; position: number; vote_count: number };
export type PollRow = SubjectColumns & {
  id: string;
  author_id: string;
  question: string;
  genre: string | null;
  closes_at: string | null;
  vote_count: number;
  is_removed: boolean;
  created_at: string;
};
export type PollItem = PollRow & { author?: Person; subject: Subject | null; options: PollOption[]; viewerVote: string | null; closed: boolean };

const COLS = "id, author_id, artist_id, release_id, track_id, genre, question, closes_at, vote_count, is_removed, created_at";

async function decorate(rows: PollRow[], viewerId: string | null): Promise<PollItem[]> {
  if (!rows.length) return [];
  const supabase = await createClient();
  const ids = rows.map((r) => r.id);
  const [people, subjects, { data: options }, { data: votes }] = await Promise.all([
    peopleByIds(rows.map((r) => r.author_id)),
    resolveSubjects(rows),
    supabase.from("poll_options").select("id, poll_id, label, position, vote_count").in("poll_id", ids).order("position"),
    viewerId ? supabase.from("poll_votes").select("poll_id, option_id").eq("user_id", viewerId).in("poll_id", ids) : Promise.resolve({ data: [] as { poll_id: string; option_id: string }[] }),
  ]);
  const voteOf = new Map((votes ?? []).map((v) => [v.poll_id, v.option_id]));
  const now = Date.now();
  return rows.map((r) => ({
    ...r,
    author: people.get(r.author_id),
    subject: subjectFor(subjects, r),
    options: ((options ?? []) as PollOption[]).filter((o) => o.poll_id === r.id),
    viewerVote: voteOf.get(r.id) ?? null,
    closed: !!r.closes_at && new Date(r.closes_at).getTime() <= now,
  }));
}

export async function listPolls(opts: { subject?: { kind: SubjectKind; id: string }; authorId?: string; limit?: number; viewerId: string | null }) {
  const supabase = await createClient();
  let q = supabase.from("polls").select(COLS).eq("is_removed", false);
  if (opts.subject) q = q.eq(`${opts.subject.kind}_id`, opts.subject.id);
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  const { data } = await q.order("created_at", { ascending: false }).limit(opts.limit ?? 20).returns<PollRow[]>();
  return decorate(data ?? [], opts.viewerId);
}

export async function getPoll(id: string, viewerId: string | null) {
  const supabase = await createClient();
  const { data } = await supabase.from("polls").select(COLS).eq("id", id).maybeSingle<PollRow>();
  if (!data) return null;
  const [poll] = await decorate([data], viewerId);
  return poll;
}
