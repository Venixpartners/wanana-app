import Link from "next/link";
import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { listDiscussions } from "@/features/discussions/queries";
import { DiscussionList } from "@/features/discussions/components/discussion-list";

export const metadata: Metadata = { title: "Community", description: "Discussions about African music, from fans at home and in the diaspora." };

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const sort = (await searchParams).sort === "new" ? "new" : "active";
  const items = await listDiscussions({ sort, limit: 40 });
  const tab = (value: "active" | "new", label: string) => (
    <Link
      href={value === "active" ? "/community" : "/community?sort=new"}
      aria-current={sort === value ? "page" : undefined}
      className={`rounded-full px-4 py-1.5 text-sm ${sort === value ? "bg-paper text-midnight" : "text-mist hover:text-paper"}`}
    >
      {label}
    </Link>
  );
  return (
    <PageShell current="/community">
      <PageTitle
        title="Community"
        intro="Talk about the songs, the albums and the artists. Disagree about the music, not the people."
        action={
          <Link href="/community/new" className="btn">
            Start a discussion
          </Link>
        }
      />
      <div className="mt-8 flex gap-1 rounded-full border border-line p-1 sm:w-fit">
        {tab("active", "Most active")}
        {tab("new", "Newest")}
      </div>
      <div className="mt-6">
        <DiscussionList items={items} />
      </div>
    </PageShell>
  );
}
