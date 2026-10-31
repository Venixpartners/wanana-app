import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell, PageTitle } from "@/components/page-shell";
import { requireMember } from "@/lib/member";
import { isUuid } from "@/lib/text";
import { getRanking } from "@/features/rankings/queries";
import { RankingEditor } from "@/features/rankings/components/ranking-editor";

export const metadata: Metadata = { title: "Edit list", robots: { index: false } };

export default async function EditRanking({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireMember();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const data = await getRanking(id);
  if (!data || data.ranking.author_id !== userId) notFound();
  const items = data.items
    .filter((i) => i.subject)
    .map((i) => ({ kind: i.subject!.kind, id: i.subject!.id, name: i.subject!.name, note: i.note ?? undefined }));
  return (
    <PageShell current="/rankings" width="max-w-2xl">
      <PageTitle title="Edit list" />
      <div className="mt-8">
        <RankingEditor initial={{ id: data.ranking.id, title: data.ranking.title, description: data.ranking.description, is_public: data.ranking.is_public, items }} />
      </div>
    </PageShell>
  );
}
