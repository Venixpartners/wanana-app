import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell, PageTitle } from "@/components/page-shell";
import { Section } from "@/features/catalogue/components/section";
import { ReleaseGrid } from "@/features/catalogue/components/release-grid";
import { ArtistGrid } from "@/features/explore/components/artist-grid";
import { genrePage, genreSlug } from "@/features/explore/queries";
import { listDiscussions } from "@/features/discussions/queries";
import { DiscussionList } from "@/features/discussions/components/discussion-list";
import { plural } from "@/lib/text";

type Props = { params: Promise<{ genre: string }> };

function slugOf(raw: string) {
  try {
    return genreSlug(decodeURIComponent(raw)).slice(0, 40);
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await genrePage(slugOf((await params).genre));
  return data ? { title: data.name, description: `${data.name} artists and releases, and what fans are saying, on Wanana.` } : { title: "Genre not found" };
}

export default async function GenrePage({ params }: Props) {
  const slug = slugOf((await params).genre);
  const data = slug ? await genrePage(slug) : null;
  if (!data) notFound();
  const discussions = await listDiscussions({ genre: data.name, limit: 8 });

  return (
    <PageShell current="/explore">
      <Link href="/explore" className="text-sm text-mist hover:text-paper">
        Back to Explore
      </Link>
      <div className="mt-2">
        <PageTitle title={data.name} intro={plural(data.artists.length, "artist")} />
      </div>
      <Section title="Artists">
        <ArtistGrid artists={data.artists} />
      </Section>
      <Section title="Releases">
        <ReleaseGrid releases={data.releases} />
      </Section>
      <Section title="Discussions">
        <DiscussionList items={discussions} empty={`No ${data.name} discussions yet.`} />
        <Link href="/community/new" className="btn-quiet mt-4">
          Start a discussion
        </Link>
      </Section>
    </PageShell>
  );
}
