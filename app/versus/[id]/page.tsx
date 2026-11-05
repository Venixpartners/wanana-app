import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { getBattle } from "@/features/versus/queries";
import { BattleCard } from "@/features/versus/components/battle-card";
import { ShareButton } from "@/features/community/components/share-button";
import { roundName } from "@/features/versus/rounds";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getBattle((await params).id, null);
  if (!data) return { title: "Battle not found" };
  const { battle: b } = data;
  const title = b.title ?? `${b.a?.title ?? "Side A"} v ${b.b?.title ?? "Side B"}`;
  const description = b.closed ? "See who fans picked on Wanana." : "Pick a side on Wanana. Results show once you vote.";
  return { title, description, openGraph: { title, description, url: `/versus/${b.id}` } };
}

export default async function BattlePage({ params }: Props) {
  const { id } = await params;
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const data = await getBattle(id, viewerId);
  if (!data) notFound();
  const { battle: b, bracket } = data;
  const path = `/versus/${b.id}`;
  const label = bracket && b.round ? `${bracket.title}, ${roundName(bracket.size, b.round).toLowerCase()}` : "Versus";

  return (
    <PageShell width="max-w-2xl" current="/versus">
      <Link href={bracket ? `/versus/bracket/${bracket.slug}` : "/versus"} className="text-sm text-mist hover:text-paper">
        {bracket ? `Back to ${bracket.title}` : "All battles"}
      </Link>
      <div className="mt-4">
        <BattleCard battle={b} viewerId={viewerId} back={path} label={label} linkTitle={false} />
      </div>
      <div className="mt-4">
        <ShareButton path={path} title={b.title ?? `${b.a?.title ?? ""} v ${b.b?.title ?? ""}: pick a side on Wanana`} />
      </div>
    </PageShell>
  );
}
