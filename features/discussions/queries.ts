import { createClient } from "@/lib/supabase/server";
import { peopleByIds, type Person } from "@/features/community/people";
import { resolveSubjects, subjectFor, type Subject, type SubjectColumns } from "@/features/community/subjects";

export type DiscussionRow = SubjectColumns & {
  id: string;
  author_id: string;
  genre: string | null;
  title: string;
  body: string;
  reply_count: number;
  like_count: number;
  last_activity_at: string;
  is_removed: boolean;
  created_at: string;
};
export type DiscussionItem = DiscussionRow & { author?: Person; subject: Subject | null };
export type ReplyRow = { id: string; discussion_id: string; parent_id: string | null; author_id: string; body: string; like_count: number; is_removed: boolean; created_at: string };

const COLS = "id, author_id, artist_id, release_id, track_id, genre, title, body, reply_count, like_count, last_activity_at, is_removed, created_at";

async function decorate(rows: DiscussionRow[]): Promise<DiscussionItem[]> {
  const [people, subjects] = await Promise.all([peopleByIds(rows.map((r) => r.author_id)), resolveSubjects(rows)]);
  return rows.map((r) => ({ ...r, author: people.get(r.author_id), subject: subjectFor(subjects, r) }));
}

export async function listDiscussions(opts: {
  sort?: "active" | "new";
  subject?: { kind: "artist" | "release" | "track"; id: string };
  genre?: string;
  authorId?: string;
  limit?: number;
} = {}): Promise<DiscussionItem[]> {
  const supabase = await createClient();
  let q = supabase.from("discussions").select(COLS).eq("is_removed", false);
  if (opts.subject) q = q.eq(`${opts.subject.kind}_id`, opts.subject.id);
  if (opts.genre) q = q.ilike("genre", opts.genre);
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  q = q.order(opts.sort === "new" ? "created_at" : "last_activity_at", { ascending: false }).limit(opts.limit ?? 30);
  const { data } = await q.returns<DiscussionRow[]>();
  return decorate(data ?? []);
}

export async function getDiscussion(id: string, viewerId: string | null) {
  const supabase = await createClient();
  const { data: row } = await supabase.from("discussions").select(COLS).eq("id", id).maybeSingle<DiscussionRow>();
  if (!row) return null;
  const { data: replyRows } = await supabase
    .from("discussion_replies")
    .select("id, discussion_id, parent_id, author_id, body, like_count, is_removed, created_at")
    .eq("discussion_id", id)
    .order("created_at", { ascending: true })
    .limit(500)
    .returns<ReplyRow[]>();
  const replies = replyRows ?? [];
  const [[discussion], people, liked, likedReplies] = await Promise.all([
    decorate([row]),
    peopleByIds(replies.map((r) => r.author_id)),
    viewerId
      ? supabase.from("discussion_likes").select("discussion_id").eq("discussion_id", id).eq("user_id", viewerId).maybeSingle()
      : Promise.resolve({ data: null }),
    viewerId && replies.length
      ? supabase.from("reply_likes").select("reply_id").eq("user_id", viewerId).in("reply_id", replies.map((r) => r.id))
      : Promise.resolve({ data: [] as { reply_id: string }[] }),
  ]);
  return {
    discussion,
    replies: replies.map((r) => ({ ...r, author: people.get(r.author_id) })),
    viewerLiked: !!liked.data,
    viewerLikedReplies: new Set((likedReplies.data ?? []).map((r) => r.reply_id)),
  };
}
