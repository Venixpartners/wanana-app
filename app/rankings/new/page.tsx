import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { requireMember } from "@/lib/member";
import { RankingEditor } from "@/features/rankings/components/ranking-editor";

export const metadata: Metadata = { title: "Make a list", robots: { index: false } };

export default async function NewRanking() {
  await requireMember();
  return (
    <PageShell current="/rankings" width="max-w-2xl">
      <PageTitle title="Make a list" intro="Pick up to 50 artists, releases or songs and put them in order." />
      <div className="mt-8">
        <RankingEditor />
      </div>
    </PageShell>
  );
}
