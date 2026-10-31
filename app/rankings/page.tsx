import Link from "next/link";
import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { listRankings } from "@/features/rankings/queries";
import { RankingList } from "@/features/rankings/components/ranking-list";

export const metadata: Metadata = { title: "Rankings", description: "Fans' own top lists of African albums, songs and artists." };

export default async function RankingsPage() {
  const items = await listRankings({ limit: 40 });
  return (
    <PageShell current="/rankings">
      <PageTitle
        title="Rankings"
        intro="Top lists made by fans. Make your own and share it."
        action={
          <Link href="/rankings/new" className="btn">
            Make a list
          </Link>
        }
      />
      <div className="mt-8">
        <RankingList items={items} empty="No lists yet. Make the first one." />
      </div>
    </PageShell>
  );
}
