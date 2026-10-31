import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { CoverArt } from "@/components/landing/cover-art";
import { getReleasePage } from "@/features/catalogue/queries";
import { artVariant } from "@/features/catalogue/slug";
import { KIND_LABEL, formatDuration, formatReleaseDate } from "@/features/catalogue/format";
import { StreamingLinks } from "@/features/catalogue/components/streaming-links";
import { ReleaseGrid } from "@/features/catalogue/components/release-grid";
import { TrackList } from "@/features/catalogue/components/track-list";
import { SubjectCommunity } from "@/features/community/components/subject-community";
import { Section } from "@/features/catalogue/components/section";
import { ShareButton } from "@/features/community/components/share-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getReleasePage((await params).slug);
  if (!data) return { title: "Release not found" };
  const { release, artist } = data;
  const title = `${release.title} by ${artist.name}`;
  const description = `${KIND_LABEL[release.kind]} by ${artist.name}. See what fans think, track by track, on Wanana.`;
  return { title, description, alternates: { canonical: `/album/${release.slug}` }, openGraph: { title, description } };
}

export default async function ReleasePage({ params }: Props) {
  const data = await getReleasePage((await params).slug);
  if (!data) notFound();
  const { release, artist, tracks, features, more } = data;
  const artists = new Map([[artist.id, { id: artist.id, slug: artist.slug, name: artist.name }]]);
  const total = tracks.reduce((s, t) => s + (t.duration_seconds ?? 0), 0);
  const facts = [
    formatReleaseDate(release.release_date),
    tracks.length ? `${tracks.length} ${tracks.length === 1 ? "song" : "songs"}` : null,
    total ? formatDuration(total) : null,
    release.label,
  ].filter(Boolean);

  return (
    <>
      <PageShell>
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <CoverArt variant={artVariant(release.slug)} className="size-44 shrink-0 rounded-2xl sm:size-52" />
          <div className="min-w-0">
            <p className="text-sm text-mist">
              {KIND_LABEL[release.kind]}
              {release.is_published ? "" : ", draft"}
            </p>
            <h1 className="mt-1 break-words font-display text-4xl font-semibold tracking-tight sm:text-5xl">{release.title}</h1>
            <p className="mt-3 text-lg">
              <Link href={`/artist/${artist.slug}`} className="hover:underline">
                {artist.name}
              </Link>
            </p>
            {facts.length > 0 && <p className="mt-2 text-sm text-mist">{facts.join(". ")}</p>}
            <div className="mt-4">
              <ShareButton path={`/album/${release.slug}`} title={`${release.title} by ${artist.name} on Wanana`} />
            </div>
          </div>
        </header>

        <div className="mt-8">
          <StreamingLinks links={release.links} title={release.title} />
        </div>

        <Section title="Tracklist">
          <TrackList tracks={tracks} artists={artists} features={features} numbered />
        </Section>

        <SubjectCommunity subject={{ kind: "release", id: release.id, slug: release.slug, name: release.title }} path={`/album/${release.slug}`} />

        {more.length > 0 && (
          <Section title={`More from ${artist.name}`}>
            <ReleaseGrid releases={more} />
          </Section>
        )}
      </PageShell>
    </>
  );
}
