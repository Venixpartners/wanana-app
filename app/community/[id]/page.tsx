import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { isUuid, plural } from "@/lib/text";
import { getDiscussion } from "@/features/discussions/queries";
import { deleteDiscussionAction, deleteReplyAction } from "@/features/discussions/actions";
import { ReplyForm } from "@/features/discussions/components/reply-form";
import { PersonLine } from "@/features/community/components/person-line";
import { SubjectChip } from "@/features/community/components/subject-chip";
import { ToggleButton } from "@/features/community/components/toggle-button";
import { ReportButton } from "@/features/community/components/report-button";
import { ShareButton } from "@/features/community/components/share-button";
import { DeleteButton } from "@/features/community/components/delete-button";
import { JoinPrompt } from "@/features/community/components/join-prompt";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Discussion not found" };
  const data = await getDiscussion(id, null);
  return data ? { title: data.discussion.title, description: data.discussion.body.slice(0, 160) } : { title: "Discussion not found" };
}

export default async function DiscussionPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const data = await getDiscussion(id, viewerId);
  if (!data) notFound();
  const { discussion: d, replies, viewerLiked, viewerLikedReplies } = data;
  const path = `/community/${d.id}`;
  const top = replies.filter((r) => !r.parent_id);
  const childrenOf = (rid: string) => replies.filter((r) => r.parent_id === rid);

  const Reply = ({ r, nested = false }: { r: (typeof replies)[number]; nested?: boolean }) => (
    <li className={nested ? "border-l-2 border-line pl-4" : ""}>
      <PersonLine person={r.author} at={r.created_at} size={24} />
      {r.is_removed ? (
        <p className="mt-2 text-sm italic text-mist">This reply was removed by a moderator.</p>
      ) : (
        <p className="mt-2 whitespace-pre-line leading-relaxed">{r.body}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {viewerId && viewerId !== r.author_id ? (
          <ToggleButton what="reply_like" id={r.id} on={viewerLikedReplies.has(r.id)} back={path} label="Like" onLabel="Liked" count={r.like_count} />
        ) : (
          <span className="text-sm text-mist">{plural(r.like_count, "like")}</span>
        )}
        {viewerId === r.author_id && <DeleteButton action={deleteReplyAction} id={r.id} back={path} />}
        {viewerId && viewerId !== r.author_id && <ReportButton targetType="reply" targetId={r.id} />}
      </div>
      {!nested && viewerId && !d.is_removed && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-mist hover:text-paper">Reply to this</summary>
          <div className="mt-2">
            <ReplyForm discussionId={d.id} parentId={r.id} back={path} compact />
          </div>
        </details>
      )}
      {!nested && childrenOf(r.id).length > 0 && (
        <ul className="mt-4 grid gap-4">
          {childrenOf(r.id).map((c) => (
            <Reply key={c.id} r={c} nested />
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <PageShell current="/community" width="max-w-3xl">
      <Link href="/community" className="text-sm text-mist hover:text-paper">
        Back to Community
      </Link>
      <article className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <SubjectChip subject={d.subject} genre={d.genre} />
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{d.title}</h1>
        <div className="mt-3">
          <PersonLine person={d.author} at={d.created_at} />
        </div>
        {d.is_removed ? (
          <p className="mt-6 italic text-mist">This discussion was removed by a moderator.</p>
        ) : (
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed">{d.body}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {viewerId && viewerId !== d.author_id ? (
            <ToggleButton what="discussion_like" id={d.id} on={viewerLiked} back={path} label="Like" onLabel="Liked" count={d.like_count} />
          ) : (
            <span className="text-sm text-mist">{plural(d.like_count, "like")}</span>
          )}
          <ShareButton path={path} title={d.title} />
          {viewerId === d.author_id && <DeleteButton action={deleteDiscussionAction} id={d.id} label="Delete discussion" />}
          {viewerId && viewerId !== d.author_id && <ReportButton targetType="discussion" targetId={d.id} />}
        </div>
      </article>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold">{plural(d.reply_count, "reply", "replies")}</h2>
        <div className="mt-5">
          {viewerId ? d.is_removed ? null : <ReplyForm discussionId={d.id} back={path} /> : <JoinPrompt signedIn={!!userId} what="join the discussion" />}
        </div>
        {top.length > 0 && (
          <ul className="mt-8 grid gap-6">
            {top.map((r) => (
              <Reply key={r.id} r={r} />
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
