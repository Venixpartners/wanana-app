import Link from "next/link";
import { ShareButton } from "@/features/community/components/share-button";
import type { Answer, Source } from "../answer";

const TYPE_LABEL: Record<Source["type"], string> = { song: "Song", album: "Release", artist: "Artist", review: "Review", discussion: "Discussion", chart: "Chart", verdict: "Fan Verdict" };

/** One answer, laid out as direct answer, why it matters, community view, evidence with sources, and what to explore next. */
export function AnswerView({ question, answer, sources, askHref }: { question: string; answer: Answer; sources: Source[]; askHref: (q: string) => string }) {
  const byId = new Map(sources.map((s) => [s.id, s]));
  const related = answer.related.map((id) => byId.get(id)).filter((s): s is Source => !!s);
  const cited = Array.from(new Set(answer.evidence.map((e) => e.source_id))).map((id) => byId.get(id)).filter((s): s is Source => !!s);
  return (
    <article className="rounded-2xl border border-line bg-ink p-5 sm:p-6">
      <p className="text-sm text-mist">You asked</p>
      <h2 className="mt-1 font-display text-xl font-semibold">{question}</h2>

      <p className="mt-5 text-lg leading-relaxed">{answer.direct_answer}</p>
      {!answer.enough_data && <p className="mt-2 text-sm text-gold">Wanana doesn&apos;t have enough fan data on this yet.</p>}

      {answer.why_it_matters && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-gold">Why it matters</h3>
          <p className="mt-1 leading-relaxed">{answer.why_it_matters}</p>
        </section>
      )}
      {answer.community_perspective && (
        <section className="mt-5">
          <h3 className="text-sm font-semibold text-gold">What fans are saying</h3>
          <p className="mt-1 leading-relaxed">{answer.community_perspective}</p>
        </section>
      )}

      {answer.evidence.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-gold">The evidence</h3>
          <ul className="mt-2 grid gap-2">
            {answer.evidence.map((e, i) => {
              const s = byId.get(e.source_id)!;
              return (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-bright" aria-hidden="true" />
                  <span>
                    {e.point}{" "}
                    <Link href={s.url} className="whitespace-nowrap text-mist underline underline-offset-4 hover:text-paper">
                      {TYPE_LABEL[s.type]}
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-gold">Explore next</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {related.map((s) => (
              <Link key={s.id} href={s.url} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-mist">
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {answer.follow_ups.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-gold">Ask next</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {answer.follow_ups.map((f) => (
              <Link key={f} href={askHref(f)} className="rounded-full border border-emerald/50 px-3 py-1.5 text-sm hover:border-emerald-bright">
                {f}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <ShareButton path={askHref(question)} title={`Ask Wanana: ${question}`} />
        <p className="text-xs text-mist">
          Built only from Wanana fan data{cited.length ? `, using ${cited.length} ${cited.length === 1 ? "source" : "sources"}` : ""}. Sharing sends the question, and whoever opens it gets a fresh answer.
        </p>
      </div>
    </article>
  );
}
