import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { PageShell, PageTitle } from "@/components/page-shell";
import { getArtistPage } from "@/features/catalogue/queries";
import { Section } from "@/features/catalogue/components/section";
import { ShareButton } from "@/features/community/components/share-button";
import { CopyCode } from "@/features/share/components/copy-code";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArtistPage((await params).slug);
  return data ? { title: `Fan kit for ${data.artist.name}`, robots: { index: false } } : { title: "Artist not found" };
}

function embedCode(path: string) {
  return `<iframe src="${new URL(`/embed${path}`, site.url)}" width="100%" height="190" style="border:0;border-radius:16px;max-width:520px" loading="lazy" title="Fan Pulse on Wanana"></iframe>`;
}

function Badge({ kind, slug, name }: { kind: "artist" | "album" | "song"; slug: string; name: string }) {
  const src = `/badge/${kind}/${slug}`;
  return (
    <figure className="rounded-2xl border border-line bg-ink p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Live Fan Pulse badge for ${name}`} width={1200} height={480} loading="lazy" className="h-auto w-full rounded-lg" />
      <figcaption className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="truncate text-mist">{name}</span>
        <a href={src} download={`wanana-${slug}.png`} className="btn-quiet shrink-0 gap-1.5">
          <Download size={15} aria-hidden="true" />
          Download
        </a>
      </figcaption>
    </figure>
  );
}

/** Free tools for artists and their teams: links to share, live badges and a score box for blogs. */
export default async function ArtistKit({ params }: Props) {
  const { slug } = await params;
  const data = await getArtistPage(slug);
  if (!data || !data.artist.is_published) notFound();
  const { artist, tracks, releases } = data;
  const songs = tracks.filter((t) => t.is_published).slice(0, 3);
  const latest = releases.find((r) => r.is_published) ?? null;

  return (
    <PageShell width="max-w-3xl">
      <Link href={`/artist/${artist.slug}`} className="text-sm text-mist hover:text-paper">
        Back to {artist.name}
      </Link>
      <div className="mt-3">
        <PageTitle title={`Fan kit for ${artist.name}`} intro="For artists, managers and their teams. Share these so fans rate the music on Wanana, then show off what they think. Free to use, and the scores update live." />
      </div>

      <Section title="Links to share">
        <ul className="grid gap-3">
          <li className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-ink p-4">
            <span className="min-w-0">
              <span className="block font-medium">Artist page</span>
              <span className="block truncate text-sm text-mist">Fans follow, rate and talk about {artist.name}</span>
            </span>
            <ShareButton path={`/artist/${artist.slug}`} title={`Rate ${artist.name} on Wanana`} />
          </li>
          {songs.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-ink p-4">
              <span className="min-w-0">
                <span className="block truncate font-medium">{t.title}</span>
                <span className="block text-sm text-mist">Ask fans to rate it</span>
              </span>
              <ShareButton path={`/song/${t.slug}`} title={`Rate my new single ${t.title} on Wanana`} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Live badges">
        <p className="mb-4 text-sm text-mist">For Instagram, press kits and your website. Download again any time for the latest score.</p>
        <div className="grid gap-4">
          <Badge kind="artist" slug={artist.slug} name={artist.name} />
          {songs[0] && <Badge kind="song" slug={songs[0].slug} name={songs[0].title} />}
          {latest && <Badge kind="album" slug={latest.slug} name={latest.title} />}
        </div>
      </Section>

      <Section title="Score box for blogs">
        <p className="mb-4 text-sm text-mist">Paste this into any website or blog post. It shows the live Fan Pulse and links readers to Wanana to add theirs.</p>
        <iframe src={`/embed/artist/${artist.slug}`} title={`Fan Pulse for ${artist.name}`} height={190} className="w-full max-w-[520px] rounded-2xl border-0" loading="lazy" />
        <div className="mt-4 grid gap-4">
          <CopyCode label={`${artist.name}, artist score`} code={embedCode(`/artist/${artist.slug}`)} />
          {songs[0] && <CopyCode label={`${songs[0].title}, song score`} code={embedCode(`/song/${songs[0].slug}`)} />}
        </div>
      </Section>
    </PageShell>
  );
}
