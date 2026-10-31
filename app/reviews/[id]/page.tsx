import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";
import { getReview } from "@/features/reviews/queries";
import { deleteCommentAction, deleteReviewAction } from "@/features/reviews/actions";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { CommentForm } from "@/features/reviews/components/comment-form";
import { PersonLine } from "@/features/community/components/person-line";
import { ReportButton } from "@/features/community/components/report-button";
import { ShareButton } from "@/features/community/components/share-button";
import { DeleteButton } from "@/features/community/components/delete-button";
import { JoinPrompt } from "@/features/community/components/join-prompt";
import { subjectHref } from "@/features/community/subjects";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = isUuid(id) ? await getReview(id, null) : null;
  if (!data) return { title: "Review not found" };
  const r = data.review;
  const title = `${r.rating}/10 for ${r.subject?.name ?? "a release"}${r.author ? ` by @${r.author.handle}` : ""}`;
  return { title, description: (r.body ?? r.title ?? "").slice(0, 160) };
}

export default async function ReviewPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const data = await getReview(id, viewerId);
  if (!data) notFound();
  const { review, comments, viewerFoundHelpful } = data;
  const path = `/reviews/${review.id}`;
  const subjectPath = review.subject ? subjectHref(review.subject) : "/explore";

  return (
    <PageShell width="max-w-3xl">
      {review.subject && (
        <Link href={subjectPath} className="text-sm text-mist hover:text-paper">
          Back to {review.subject.name}
        </Link>
      )}
      <div className="mt-4">
        <ReviewCard review={review} viewerId={viewerId} helpful={viewerFoundHelpful} back={path} showSubject full />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ShareButton path={path} title={`A review on Wanana`} />
        {viewerId === review.author_id && <DeleteButton action={deleteReviewAction} id={review.id} back={subjectPath} label="Delete review" />}
        {viewerId && viewerId !== review.author_id && <ReportButton targetType="review" targetId={review.id} />}
      </div>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold">Comments</h2>
        <div className="mt-5">{viewerId ? <CommentForm reviewId={review.id} back={path} /> : <JoinPrompt signedIn={!!userId} what="comment" />}</div>
        {comments.length > 0 && (
          <ul className="mt-8 grid gap-6">
            {comments.map((c) => (
              <li key={c.id}>
                <PersonLine person={c.author} at={c.created_at} size={24} />
                {c.is_removed ? <p className="mt-2 text-sm italic text-mist">This comment was removed by a moderator.</p> : <p className="mt-2 whitespace-pre-line leading-relaxed">{c.body}</p>}
                <div className="mt-2 flex gap-3">
                  {viewerId === c.author_id && <DeleteButton action={deleteCommentAction} id={c.id} back={path} />}
                  {viewerId && viewerId !== c.author_id && <ReportButton targetType="review_comment" targetId={c.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
