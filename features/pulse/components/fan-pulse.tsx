import { plural } from "@/lib/text";
import { SETTLED_AT, pulseWord, splitText } from "../charts";
import type { Pulse, PulseRow } from "../queries";

function Side({ label, row }: { label: string; row: PulseRow | null }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-mist">{label}</span>
        <span className="tabular-nums">{row ? row.pulse : "No scores"}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        {row && <div className={`h-full rounded-full ${label === "Home" ? "bg-emerald-bright" : "bg-orange"}`} style={{ width: `${row.pulse}%` }} />}
      </div>
      {row && <p className="mt-1 text-xs text-mist">{plural(row.ratings, "fan")}</p>}
    </div>
  );
}

/** Fan Pulse with the home and diaspora split, shown on artist, release and song pages. */
export function FanPulse({ pulse, what }: { pulse: Pulse; what: string }) {
  const all = pulse.all;
  if (!all) {
    return (
      <div className="rounded-2xl border border-line bg-ink p-5">
        <p className="text-sm text-mist">Fan Pulse</p>
        <p className="mt-2 text-sm text-mist">No scores yet. Be the first to score this {what} out of 10.</p>
      </div>
    );
  }
  const split = splitText(pulse.home?.pulse ?? null, pulse.diaspora?.pulse ?? null);
  const trend = all.ratings_7d - all.ratings_prev_7d;
  return (
    <div className="rounded-2xl border border-line bg-ink p-5">
      <p className="text-sm text-mist">Fan Pulse</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-5xl font-semibold tabular-nums">{all.pulse}</span>
        <span className="text-mist">/ 100</span>
        <span className="ml-auto rounded-full border border-line px-2.5 py-0.5 text-xs text-gold">{pulseWord(all.pulse)}</span>
      </p>
      <p className="mt-2 text-sm text-mist">
        Fans average {all.average.toFixed(1)} out of 10 from {plural(all.ratings, "score")}.
        {all.ratings < SETTLED_AT && " Early days, so this will move as more fans weigh in."}
      </p>

      <div className="mt-5 grid gap-4">
        <Side label="Home" row={pulse.home} />
        <Side label="Diaspora" row={pulse.diaspora} />
      </div>
      {split && <p className="mt-4 text-sm">{split}</p>}

      <p className="mt-4 border-t border-line pt-3 text-xs text-mist">
        {plural(all.ratings_7d, "new score")} this week
        {trend > 0 ? `, up from ${all.ratings_prev_7d} last week.` : trend < 0 ? `, down from ${all.ratings_prev_7d} last week.` : "."}
      </p>
    </div>
  );
}
