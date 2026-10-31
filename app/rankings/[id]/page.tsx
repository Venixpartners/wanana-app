import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { isUuid, timeAgo } from "@/lib/text";
import { getRanking } from "@/features/rankings/queries";
import { deleteRankingAction } from "@/features/rankings/actions";
import { KIND_WORD, subjectHref } from "@/features/community/subjects";
import { PersonLine } from "@/features/community/components/person-line";
import { ShareButton } from "@/features/community/components/share-button";
import { ReportButton } from "@/features/community/components/report-button";
import { DeleteButton } from "@/features/community/components/delete-button";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = isUuid(id) ? await getRanking(id) : null;
  return data ? { title: data.ranking.title, description: data.ranking.description ?? `A fan ranking on Wanana.` } : { title: "List not found" };
}

export default async function RankingPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const data = await getRanking(id);
  if (!data) notFound();
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const { ranking, author, items } = data;
  const own = viewerId === ranking.author_id;
  const path = `/rankings/${ranking.id}`;

  return (
    <PageShell current="/rankings" width="max-w-3xl">
      <Link href="/rankings" className="text-sm text-mist hover:text-paper">
        Back to Rankings
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">{ranking.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mist">
        <PersonLine person={author} />
        <span>updated {timeAgo(ranking.updated_at)}</span>
        {!ranking.is_public && <span className="rounded-full border border-line px-2 py-0.5 text-xs">Private</span>}
      </div>
      {ranking.description && <p className="mt-5 max-w-2xl whitespace-pre-line leading-relaxed">{ranking.description}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {ranking.is_public && <ShareButton path={path} title={ranking.title} />}
        {own && (
          <Link href={`${path}/edit`} className="btn-quiet">
            Edit list
          </Link>
        )}
        {own && <DeleteButton action={deleteRankingAction} id={ranking.id} label="Delete list" />}
        {viewerId && !own && <ReportButton targetType="ranking" targetId={ranking.id} />}
      </div>

      <ol className="mt-8 grid gap-3">
        {items.map((it) => (
          <li key={it.position} className="flex gap-4 rounded-2xl border border-line bg-ink p-4 sm:p-5">
            <span className="w-8 shrink-0 font-display text-2xl font-semibold tabular-nums text-gold">{it.position}</span>
            <div className="min-w-0">
              {it.subject ? (
                <Link href={subjectHref(it.subject)} className="font-medium hover:underline">
                  {it.subject.name}
                </Link>
              ) : (
                <span className="text-mist">No longer in the catalogue</span>
              )}
              {it.subject && <p className="text-sm capitalize text-mist">{KIND_WORD[it.subject.kind]}</p>}
              {it.note && <p className="mt-2 leading-relaxed">{it.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
