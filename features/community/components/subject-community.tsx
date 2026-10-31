import Link from "next/link";
import { getViewer } from "@/lib/supabase/server";
import { Section } from "@/features/catalogue/components/section";
import { RatingSummary } from "@/features/reviews/components/rating-summary";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { listReviews, ratingSummary, viewerHelpful, viewerReview } from "@/features/reviews/queries";
import { listDiscussions } from "@/features/discussions/queries";
import { DiscussionList } from "@/features/discussions/components/discussion-list";
import { listPolls } from "@/features/polls/queries";
import { PollCard } from "@/features/polls/components/poll-card";
import { JoinPrompt } from "./join-prompt";
import { Empty } from "./empty";
import { KIND_WORD, type Subject } from "../subjects";

/** Ratings, reviews, discussions and polls for an artist, release or song page. */
export async function SubjectCommunity({ subject, path }: { subject: Subject; path: string }) {
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const what = KIND_WORD[subject.kind];
  const [summary, mine, reviews, discussions, polls] = await Promise.all([
    ratingSummary(subject),
    viewerReview(subject, viewerId),
    listReviews({ subject, limit: 6 }),
    listDiscussions({ subject, limit: 5 }),
    listPolls({ subject, limit: 2, viewerId }),
  ]);
  const helpful = await viewerHelpful(reviews.map((r) => r.id), viewerId);
  const query = `${subject.kind}=${subject.slug}`;

  return (
    <>
      <div className="mt-8 grid gap-6 md:grid-cols-[320px_1fr]">
        <RatingSummary average={summary.average} count={summary.count} what={what} />
        {viewerId ? (
          <ReviewForm subject={{ kind: subject.kind, id: subject.id, name: subject.name }} existing={mine} back={path} />
        ) : (
          <JoinPrompt signedIn={!!userId} what={`rate this ${what}`} />
        )}
      </div>

      <Section title="Reviews">
        {reviews.length ? (
          <div className="grid gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} viewerId={viewerId} helpful={helpful.has(r.id)} back={path} />
            ))}
          </div>
        ) : (
          <Empty>No written reviews yet. Scores without words count towards the rating too.</Empty>
        )}
      </Section>

      <Section title="Discussions">
        <DiscussionList items={discussions} showSubject={false} empty={`No one has started a discussion about this ${what} yet.`} />
        <Link href={`/community/new?${query}`} className="btn-quiet mt-4">
          Start a discussion
        </Link>
      </Section>

      <Section title="Polls">
        {polls.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {polls.map((p) => (
              <PollCard key={p.id} poll={p} viewerId={viewerId} back={path} />
            ))}
          </div>
        ) : (
          <Empty>No polls about this {what} yet.</Empty>
        )}
        <Link href={`/polls/new?${query}`} className="btn-quiet mt-4">
          Ask a poll question
        </Link>
      </Section>
    </>
  );
}
