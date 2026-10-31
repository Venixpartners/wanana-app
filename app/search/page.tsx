import Link from "next/link";
import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { Section } from "@/features/catalogue/components/section";
import { SearchBox } from "@/features/search/components/search-box";
import { cleanQuery, searchCatalogue, searchCommunity, type CatalogueHit } from "@/features/search/queries";
import { subjectHref } from "@/features/community/subjects";
import { Avatar } from "@/features/profile/components/avatar";
import { plural } from "@/lib/text";

export const metadata: Metadata = { title: "Search" };

function HitList({ hits, label }: { hits: CatalogueHit[]; label: string }) {
  if (!hits.length) return null;
  return (
    <Section title={label}>
      <ul className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
        {hits.map((h) => (
          <li key={h.id}>
            <Link href={subjectHref(h)} className="block px-4 py-3 hover:bg-midnight/40 sm:px-5">
              <span className="block truncate font-medium">{h.name}</span>
              {h.detail && <span className="block truncate text-sm text-mist">{h.detail}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = cleanQuery((await searchParams).q);
  const [catalogue, community] = q.length >= 2 ? await Promise.all([searchCatalogue(q), searchCommunity(q)]) : [null, null];
  const total = catalogue && community
    ? catalogue.artists.length + catalogue.releases.length + catalogue.tracks.length + community.people.length + community.discussions.length + community.polls.length + community.rankings.length
    : 0;

  return (
    <PageShell current="/search" width="max-w-3xl">
      <PageTitle title="Search" />
      <div className="mt-6">
        <SearchBox defaultValue={q} autoFocus={!q} />
      </div>

      {q.length === 1 && <p className="mt-6 text-mist">Type at least two letters.</p>}
      {catalogue && community && total === 0 && (
        <p className="mt-8 text-mist">
          Nothing matches “{q}” yet. Try a different spelling, or{" "}
          <Link href="/explore" className="text-paper underline underline-offset-4">
            explore by genre
          </Link>
          .
        </p>
      )}

      {catalogue && (
        <>
          <HitList hits={catalogue.artists} label="Artists" />
          <HitList hits={catalogue.tracks} label="Songs" />
          <HitList hits={catalogue.releases} label="Albums, EPs and singles" />
        </>
      )}

      {community && community.people.length > 0 && (
        <Section title="People">
          <ul className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
            {community.people.map((p) => (
              <li key={p.id}>
                <Link href={`/u/${p.handle}`} className="flex items-center gap-3 px-4 py-3 hover:bg-midnight/40 sm:px-5">
                  <Avatar name={p.display_name} url={p.avatar_url} size={32} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.display_name}</span>
                    <span className="block truncate text-sm text-mist">@{p.handle}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {community && community.discussions.length > 0 && (
        <Section title="Discussions">
          <ul className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
            {community.discussions.map((d) => (
              <li key={d.id}>
                <Link href={`/community/${d.id}`} className="block px-4 py-3 hover:bg-midnight/40 sm:px-5">
                  <span className="block truncate font-medium">{d.title}</span>
                  <span className="block text-sm text-mist">{plural(d.reply_count, "reply", "replies")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {community && community.polls.length > 0 && (
        <Section title="Polls">
          <ul className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
            {community.polls.map((p) => (
              <li key={p.id}>
                <Link href={`/polls/${p.id}`} className="block px-4 py-3 hover:bg-midnight/40 sm:px-5">
                  <span className="block truncate font-medium">{p.question}</span>
                  <span className="block text-sm text-mist">{plural(p.vote_count, "vote")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {community && community.rankings.length > 0 && (
        <Section title="Rankings">
          <ul className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
            {community.rankings.map((r) => (
              <li key={r.id}>
                <Link href={`/rankings/${r.id}`} className="block px-4 py-3 hover:bg-midnight/40 sm:px-5">
                  <span className="block truncate font-medium">{r.title}</span>
                  <span className="block text-sm text-mist">{plural(r.item_count, "entry", "entries")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </PageShell>
  );
}
