import Link from "next/link";
import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { Section } from "@/features/catalogue/components/section";
import { Empty } from "@/features/community/components/empty";
import { listBattles, listBrackets } from "@/features/versus/queries";
import { BattleCard } from "@/features/versus/components/battle-card";
import { roundName } from "@/features/versus/rounds";

export const metadata: Metadata = {
  title: "Versus",
  description: "Two songs, one vote each. Head to head battles and brackets decided by fans at home and in the diaspora.",
  openGraph: { title: "Versus on Wanana", description: "Two songs, one vote each. Decided by fans at home and in the diaspora.", url: "/versus" },
};

export default async function VersusPage() {
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const [open, closed, brackets] = await Promise.all([listBattles({ open: true, viewerId }), listBattles({ open: false, limit: 6, viewerId }), listBrackets()]);

  return (
    <PageShell current="/versus">
      <PageTitle title="Versus" intro="Two songs head to head. One vote each, and the results show once you've voted." />

      {brackets.length > 0 && (
        <Section title="Brackets">
          <ul className="grid gap-3 sm:grid-cols-2">
            {brackets.map((b) => (
              <li key={b.id}>
                <Link href={`/versus/bracket/${b.slug}`} className="block rounded-2xl border border-line bg-ink p-4 hover:border-mist">
                  <span className="block font-display text-lg font-semibold">{b.title}</span>
                  <span className="mt-1 block text-sm text-mist">
                    {b.status === "done" ? "Finished" : `${roundName(b.size, b.current_round)} now on`}. {b.size} {b.kind === "track" ? "songs" : "releases"}.
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="On now">
        {open.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {open.map((b) => (
              <BattleCard key={b.id} battle={b} viewerId={viewerId} back="/versus" />
            ))}
          </div>
        ) : (
          <Empty>No battles running right now. Check back soon.</Empty>
        )}
      </Section>

      {closed.length > 0 && (
        <Section title="Recent results">
          <div className="grid gap-4 md:grid-cols-2">
            {closed.map((b) => (
              <BattleCard key={b.id} battle={b} viewerId={viewerId} back="/versus" />
            ))}
          </div>
        </Section>
      )}
    </PageShell>
  );
}
