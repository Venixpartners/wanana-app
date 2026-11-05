import Link from "next/link";
import { PageShell, PageTitle } from "@/components/page-shell";
import { Section } from "@/features/catalogue/components/section";
import { Empty } from "@/features/community/components/empty";
import { ShareButton } from "@/features/community/components/share-button";
import { getVerdict, liveFriday, pastVerdicts, verdictDateText } from "../queries";
import { VerdictList } from "./verdict-list";

const ABOUT = "Every week's new releases, ranked by what fans scored them from release day to Sunday night, Lagos time. The verdict is saved first thing on Monday.";

/** Shared by /verdict (latest week) and /verdict/[friday]. */
export async function VerdictPage({ friday, showLive }: { friday: string | null; showLive: boolean }) {
  const live = showLive ? liveFriday() : null;
  const [week, now, past] = await Promise.all([
    friday ? getVerdict(friday) : Promise.resolve({ entries: [], saved: false }),
    live && live !== friday ? getVerdict(live) : Promise.resolve(null),
    pastVerdicts(),
  ]);

  return (
    <PageShell current="/charts">
      <PageTitle
        title="Fan Verdict"
        intro={ABOUT}
        action={friday && week.entries.length > 0 ? <ShareButton path={`/verdict/${friday}`} title={`The Fan Verdict for the week of ${verdictDateText(friday)}`} /> : undefined}
      />

      {now && (
        <Section title="This weekend so far">
          {now.entries.length ? <VerdictList entries={now.entries} /> : <Empty>Scores are coming in. A release needs three to make the verdict.</Empty>}
          <p className="mt-3 text-xs text-mist">Still open. Scores count until Sunday at midnight.</p>
        </Section>
      )}

      {friday && (
        <Section title={`Week of ${verdictDateText(friday)}`}>
          {week.entries.length ? <VerdictList entries={week.entries} /> : <Empty>No release from that week reached three fan scores.</Empty>}
          {!week.saved && week.entries.length > 0 && <p className="mt-3 text-xs text-mist">Worked out from the scores. The saved verdict appears on Monday.</p>}
        </Section>
      )}

      {past.length > 0 && (
        <Section title="Past verdicts">
          <ul className="flex flex-wrap gap-2">
            {past.map((f) => (
              <li key={f}>
                <Link
                  href={`/verdict/${f}`}
                  aria-current={f === friday ? "page" : undefined}
                  className={`inline-block rounded-full border px-3 py-1.5 text-sm ${f === friday ? "border-emerald text-paper" : "border-line text-mist hover:border-mist hover:text-paper"}`}
                >
                  {verdictDateText(f)}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </PageShell>
  );
}
