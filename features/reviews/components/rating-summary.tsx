import { plural } from "@/lib/text";

export function RatingSummary({ average, count, what }: { average: number | null; count: number; what: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink p-5">
      <p className="text-sm text-mist">Fan rating</p>
      {average === null ? (
        <p className="mt-2 text-sm text-mist">No ratings yet. Be the first to score this {what} out of 10.</p>
      ) : (
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-4xl font-semibold tabular-nums">{average.toFixed(1)}</span>
          <span className="text-mist">/ 10 from {plural(count, "fan")}</span>
        </p>
      )}
      <p className="mt-3 text-xs text-mist">Fan Pulse, with the home and diaspora split, arrives with Wanana Charts.</p>
    </div>
  );
}
