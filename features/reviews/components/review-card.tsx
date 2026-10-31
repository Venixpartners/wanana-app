import Link from "next/link";
import { PersonLine } from "@/features/community/components/person-line";
import { SubjectChip } from "@/features/community/components/subject-chip";
import { ToggleButton } from "@/features/community/components/toggle-button";
import type { ReviewItem } from "../queries";

export function ScoreBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald font-display text-lg font-semibold tabular-nums" aria-label={`Scored ${rating} out of 10`}>
      {rating}
    </span>
  );
}

export function ReviewCard({
  review,
  viewerId,
  helpful,
  back,
  showSubject = false,
  full = false,
}: {
  review: ReviewItem;
  viewerId: string | null;
  helpful: boolean;
  back: string;
  showSubject?: boolean;
  full?: boolean;
}) {
  const own = viewerId === review.author_id;
  const body = review.body ?? "";
  const long = !full && body.length > 600;
  return (
    <article className="rounded-2xl border border-line bg-ink p-5">
      <div className="flex items-start gap-4">
        <ScoreBadge rating={review.rating} />
        <div className="min-w-0 flex-1">
          {review.title && <h3 className="font-display font-semibold">{review.title}</h3>}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PersonLine person={review.author} at={review.created_at} size={22} />
            {review.audience && <span className={`text-xs ${review.audience === "home" ? "text-emerald-bright" : "text-gold"}`}>{review.audience}</span>}
          </div>
          {showSubject && (
            <div className="mt-2">
              <SubjectChip subject={review.subject} />
            </div>
          )}
        </div>
      </div>
      {body && <p className="mt-4 whitespace-pre-line leading-relaxed">{long ? `${body.slice(0, 600).trimEnd()}…` : body}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {viewerId && !own ? (
          <ToggleButton what="review_helpful" id={review.id} on={helpful} back={back} label="Helpful" onLabel="Helpful" count={review.helpful_count} />
        ) : (
          <span className="text-sm text-mist">{review.helpful_count} found this helpful</span>
        )}
        {!full && (
          <Link href={`/reviews/${review.id}`} className="text-sm text-mist hover:text-paper">
            {long ? "Read more" : review.comment_count ? `${review.comment_count} comments` : "Comment"}
          </Link>
        )}
      </div>
    </article>
  );
}
