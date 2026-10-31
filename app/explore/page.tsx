import Link from "next/link";
import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { Section } from "@/features/catalogue/components/section";
import { ReleaseGrid } from "@/features/catalogue/components/release-grid";
import { TrackList } from "@/features/catalogue/components/track-list";
import { SearchBox } from "@/features/search/components/search-box";
import { ArtistGrid } from "@/features/explore/components/artist-grid";
import { GenreChips } from "@/features/explore/components/genre-chips";
import { listGenres, newArtists, newReleases, newSongs } from "@/features/explore/queries";
import { listReviews, viewerHelpful } from "@/features/reviews/queries";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { listDiscussions } from "@/features/discussions/queries";
import { DiscussionList } from "@/features/discussions/components/discussion-list";
import { listPolls } from "@/features/polls/queries";
import { PollCard } from "@/features/polls/components/poll-card";
import { listRankings } from "@/features/rankings/queries";
import { RankingList } from "@/features/rankings/components/ranking-list";
import { Empty } from "@/features/community/components/empty";

export const metadata: Metadata = { title: "Explore", description: "New African music, the genres fans follow, and what people are saying about it on Wanana." };

export default async function ExplorePage() {
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const [genres, releases, songs, artists, reviews, discussions, polls, rankings] = await Promise.all([
    listGenres(),
    newReleases(8),
    newSongs(8),
    newArtists(12),
    listReviews({ sort: "helpful", limit: 4 }),
    listDiscussions({ sort: "active", limit: 5 }),
    listPolls({ limit: 2, viewerId }),
    listRankings({ limit: 4 }),
  ]);
  const helpful = await viewerHelpful(reviews.map((r) => r.id), viewerId);

  return (
    <PageShell current="/explore">
      <PageTitle title="Explore" intro="New music, the genres people follow, and the conversations around them." />
      <div className="mt-6 max-w-2xl">
        <SearchBox size="sm" />
      </div>

      <Section title="Genres">
        <GenreChips genres={genres} />
      </Section>

      <Section title="New releases">
        <ReleaseGrid releases={releases} />
      </Section>

      <Section title="Recently added songs">
        {songs.tracks.length ? <TrackList tracks={songs.tracks} artists={songs.artists} features={new Map()} /> : <Empty>Songs appear here as they are added.</Empty>}
      </Section>

      <Section title="Artists">
        <ArtistGrid artists={artists} empty="Artists appear here as they are added." />
      </Section>

      <Section title="Reviews fans found helpful">
        {reviews.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} viewerId={viewerId} helpful={helpful.has(r.id)} back="/explore" showSubject />
            ))}
          </div>
        ) : (
          <Empty>No written reviews yet.</Empty>
        )}
      </Section>

      <Section title="Active discussions">
        <DiscussionList items={discussions} />
        <Link href="/community" className="btn-quiet mt-4">
          All discussions
        </Link>
      </Section>

      <Section title="Latest polls">
        {polls.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {polls.map((p) => (
              <PollCard key={p.id} poll={p} viewerId={viewerId} back="/explore" />
            ))}
          </div>
        ) : (
          <Empty>No polls yet.</Empty>
        )}
      </Section>

      <Section title="Fan rankings">
        <RankingList items={rankings} empty="No rankings yet." />
      </Section>
    </PageShell>
  );
}
