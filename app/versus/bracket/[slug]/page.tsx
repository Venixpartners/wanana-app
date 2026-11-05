import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Crown } from "lucide-react";
import { PageShell, PageTitle } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { getBracket } from "@/features/versus/queries";
import { BattleCard } from "@/features/versus/components/battle-card";
import { Section } from "@/features/catalogue/components/section";
import { ShareButton } from "@/features/community/components/share-button";
import { roundCount, roundName } from "@/features/versus/rounds";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getBracket((await params).slug, null);
  if (!data) return { title: "Bracket not found" };
  const { bracket: b, champion } = data;
  const description = champion ? `${champion.title} won, as voted by fans on Wanana.` : `${roundName(b.size, b.current_round)} now on. Pick your side on Wanana.`;
  return { title: b.title, description, openGraph: { title: b.title, description, url: `/versus/bracket/${b.slug}` } };
}

export default async function BracketPage({ params }: Props) {
  const { slug } = await params;
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const data = await getBracket(slug, viewerId);
  if (!data) notFound();
  const { bracket: b, battles, champion } = data;
  const path = `/versus/bracket/${b.slug}`;
  const rounds = Array.from({ length: roundCount(b.size) }, (_, i) => i + 1).reverse();

  return (
    <PageShell current="/versus">
      <Link href="/versus" className="text-sm text-mist hover:text-paper">
        All battles
      </Link>
      <div className="mt-3">
        <PageTitle
          title={b.title}
          intro={b.description ?? `${b.size} ${b.kind === "track" ? "songs" : "releases"}, ${b.round_hours} hours a round. Winners move on until one is left.`}
          action={<ShareButton path={path} title={`${b.title} on Wanana`} />}
        />
      </div>

      {champion && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-gold/60 bg-ink p-5">
          <Crown className="text-gold" aria-hidden="true" />
          <p>
            <span className="text-mist">Fans crowned </span>
            <Link href={champion.href} className="font-display text-lg font-semibold hover:underline">
              {champion.title}
            </Link>
            {champion.artist && <span className="text-mist">, {champion.artist}</span>}
          </p>
        </div>
      )}

      {rounds.map((r) => {
        const inRound = battles.filter((x) => x.round === r);
        if (!inRound.length) return null;
        return (
          <Section key={r} title={roundName(b.size, r)}>
            <div className="grid gap-4 md:grid-cols-2">
              {inRound.map((x) => (
                <BattleCard key={x.id} battle={x} viewerId={viewerId} back={path} label={roundName(b.size, r)} />
              ))}
            </div>
          </Section>
        );
      })}
    </PageShell>
  );
}
