import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, PageTitle } from "@/components/page-shell";
import { CHARTS, CHART_INFO, isChart } from "@/features/pulse/charts";
import { getChart } from "@/features/pulse/queries";
import { ChartTable } from "@/features/pulse/components/chart-table";
import { Empty } from "@/features/community/components/empty";
import { ShareButton } from "@/features/community/components/share-button";

type Props = { params: Promise<{ chart: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chart } = await params;
  if (!isChart(chart)) return { title: "Chart not found" };
  const info = CHART_INFO[chart];
  const title = `${info.title}: Wanana Charts`;
  const description = `${info.about} Ranked by what fans think, not just how often a song is played.`;
  return { title, description, alternates: { canonical: `/charts/${chart}` }, openGraph: { title, description, url: `/charts/${chart}` } };
}

export default async function ChartPage({ params }: Props) {
  const { chart } = await params;
  if (!isChart(chart)) notFound();
  const info = CHART_INFO[chart];
  const entries = await getChart(chart, 50);

  return (
    <PageShell current="/charts">
      <PageTitle title="Wanana Charts" intro="Ranked by what fans think, not just how often a song is played." />

      <nav aria-label="Charts" className="mt-6 flex gap-2 overflow-x-auto">
        {CHARTS.map((c) => (
          <Link
            key={c}
            href={`/charts/${c}`}
            aria-current={c === chart ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${c === chart ? "border-emerald bg-emerald/20 text-paper" : "border-line text-mist hover:border-mist hover:text-paper"}`}
          >
            {CHART_INFO[c].short}
          </Link>
        ))}
        <Link href="/verdict" className="shrink-0 rounded-full border border-gold/50 px-4 py-2 text-sm text-gold transition hover:border-gold">
          Fan Verdict
        </Link>
      </nav>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">{info.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-mist">{info.about}</p>
        </div>
        {entries.length > 0 && <ShareButton path={`/charts/${chart}`} title={`The Wanana ${info.title} this week`} />}
      </div>

      <div className="mt-5">
        {entries.length ? (
          <ChartTable entries={entries} />
        ) : (
          <Empty>
            {chart === "rising"
              ? "No song is gaining scores fast enough to rise this week yet."
              : "The chart fills as fans score songs. A song needs three scores to enter."}{" "}
            <Link href="/explore" className="text-paper underline">
              Find a song to score
            </Link>
          </Empty>
        )}
      </div>

      <p className="mt-6 text-xs text-mist">
        Arrows compare with the chart taken at the start of this week. Charts are taken every Monday. Fan Pulse is out of 100 and weighted so a handful of scores can&apos;t swing it.
      </p>
    </PageShell>
  );
}
