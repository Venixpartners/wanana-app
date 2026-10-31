import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CoverArt } from "@/components/landing/cover-art";
import { getTrackPage } from "@/features/catalogue/queries";
import { artVariant } from "@/features/catalogue/slug";
import { KIND_LABEL, formatDuration, formatReleaseDate } from "@/features/catalogue/format";
import { StreamingLinks } from "@/features/catalogue/components/streaming-links";
import { ArtistLine } from "@/features/catalogue/components/artist-line";
import { TrackList } from "@/features/catalogue/components/track-list";
import { PulsePlaceholder } from "@/features/catalogue/components/pulse-placeholder";
import { Section } from "@/features/catalogue/components/section";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getTrackPage((await params).slug);
  if (!data) return { title: "Song not found" };
  const { track, artist } = data;
  const title = `${track.title} by ${artist.name}`;
  const description = `Ratings, reviews and conversation about ${track.title} by ${artist.name} on Wanana.`;
  return { title, description, alternates: { canonical: `/song/${track.slug}` }, openGraph: { title, description } };
}

export default async function SongPage({ params }: Props) {
  const data = await getTrackPage((await params).slug);
  if (!data) notFound();
  const { track, artist, release, featured, more } = data;
  const main = { id: artist.id, slug: artist.slug, name: artist.name };
  const date = track.release_date ?? release?.release_date ?? null;
  const facts = [formatReleaseDate(date), formatDuration(track.duration_seconds)].filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <header className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-end sm:pt-10">
          <CoverArt variant={artVariant(release?.slug ?? track.slug)} className="size-44 shrink-0 rounded-2xl sm:size-52" />
          <div className="min-w-0">
            <p className="text-sm text-mist">Song{track.is_published ? "" : ", draft"}</p>
            <h1 className="mt-1 break-words font-display text-4xl font-semibold tracking-tight sm:text-5xl">{track.title}</h1>
            <p className="mt-3 text-lg">
              <ArtistLine main={main} featured={featured} />
            </p>
            {release && (
              <p className="mt-2 text-sm text-mist">
                From the {KIND_LABEL[release.kind].toLowerCase()}{" "}
                <Link href={`/album/${release.slug}`} className="text-paper hover:underline">
                  {release.title}
                </Link>
              </p>
            )}
            {facts.length > 0 && <p className="mt-1 text-sm text-mist">{facts.join(". ")}</p>}
          </div>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
          <StreamingLinks links={track.links} title={track.title} />
          <PulsePlaceholder what="song" />
        </div>

        {more.length > 0 && (
          <Section title={`More from ${artist.name}`}>
            <TrackList tracks={more} artists={new Map([[artist.id, main]])} features={new Map()} />
          </Section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
