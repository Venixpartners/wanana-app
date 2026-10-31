import { Section } from "@/features/catalogue/components/section";
import { listReviews, viewerHelpful } from "@/features/reviews/queries";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { listDiscussions } from "@/features/discussions/queries";
import { DiscussionList } from "@/features/discussions/components/discussion-list";
import { listRankings } from "@/features/rankings/queries";
import { RankingList } from "@/features/rankings/components/ranking-list";
import { Empty } from "./empty";

/** What someone has written on Wanana, for their profile page. */
export async function ProfileActivity({ authorId, viewerId, path, own }: { authorId: string; viewerId: string | null; path: string; own: boolean }) {
  const [reviews, discussions, rankings] = await Promise.all([
    listReviews({ authorId, sort: "new", limit: 10 }),
    listDiscussions({ authorId, sort: "new", limit: 10 }),
    listRankings({ authorId, includePrivate: own, limit: 10 }),
  ]);
  const helpful = await viewerHelpful(reviews.map((r) => r.id), viewerId);
  return (
    <>
      <Section title="Reviews">
        {reviews.length ? (
          <div className="grid gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} viewerId={viewerId} helpful={helpful.has(r.id)} back={path} showSubject />
            ))}
          </div>
        ) : (
          <Empty>No written reviews yet.</Empty>
        )}
      </Section>
      <Section title="Discussions">
        <DiscussionList items={discussions} empty="No discussions started yet." />
      </Section>
      <Section title="Rankings">
        <RankingList items={rankings} empty="No lists yet." />
      </Section>
    </>
  );
}
