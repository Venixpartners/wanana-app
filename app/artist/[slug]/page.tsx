import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CoverArt } from "@/components/landing/cover-art";
import { countryName } from "@/lib/countries";
import { getArtistPage } from "@/features/catalogue/queries";
import { artVariant } from "@/features/catalogue/slug";
import { StreamingLinks } from "@/features/catalogue/components/streaming-links";
import { ReleaseGrid } from "@/features/catalogue/components/release-grid";
import { TrackList } from "@/features/catalogue/components/track-list";
import { PulsePlaceholder } from "@/features/catalogue/components/pulse-placeholder";
import { Section } from "@/features/catalogue/components/section";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArtistPage((await params).slug);
  if (!data) return { title: "Artist not found" };
  const { artist } = data;
  const description = artist.summary ?? `What fans think of ${artist.name}: ratings, reviews and conversation on Wanana.`;
  return { title: artist.name, description, alternates: { canonical: `/artist/${artist.slug}` }, openGraph: { title: artist.name, description } };
}

export default async function ArtistPage({ params }: Props) {
  const data = await getArtistPage((await params).slug);
  if (!data) notFound();
  const { artist, releases, tracks, features, featuredOn, mainArtists } = data;
  const self = new Map([[artist.id, { id: artist.id, slug: artist.slug, name: artist.name }]]);
  const facts = [artist.country_code ? countryName(artist.country_code) : null, artist.genres.join(", ") || null].filter(Boolean).join(". ");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <header className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-end sm:pt-10">
          <CoverArt variant={artVariant(artist.slug)} className="size-36 shrink-0 rounded-full sm:size-44" />
          <div className="min-w-0">
            <p className="text-sm text-mist">Artist{artist.is_published ? "" : ", draft"}</p>
            <h1 className="mt-1 break-words font-display text-4xl font-semibold tracking-tight sm:text-5xl">{artist.name}</h1>
            {facts && <p className="mt-3 text-mist">{facts}</p>}
          </div>
        </header>

        {artist.summary && <p className="mt-8 max-w-2xl text-lg leading-relaxed">{artist.summary}</p>}

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
          <StreamingLinks links={artist.links} title={artist.name} />
          <PulsePlaceholder what="artist" />
        </div>

        <Section title="Songs">
          <TrackList tracks={tracks} artists={self} features={features} />
        </Section>

        <Section title="Releases">
          <ReleaseGrid releases={releases} />
        </Section>

        {featuredOn.length > 0 && (
          <Section title="Featured on">
            <TrackList tracks={featuredOn} artists={mainArtists} features={new Map()} />
          </Section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
