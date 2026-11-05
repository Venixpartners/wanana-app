import Link from "next/link";
import { Crown } from "lucide-react";
import { CoverArt } from "@/components/landing/cover-art";
import { SubmitButton } from "@/features/community/components/submit-button";
import { plural } from "@/lib/text";
import { voteBattleAction } from "../actions";
import { split, splitLine, timeLeft } from "../rounds";
import type { Battle, Side } from "../queries";

function SideBlock({ side, pct, won, mine, show }: { side: Side | null; pct: number; won: boolean; mine: boolean; show: boolean }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center rounded-xl border p-3 text-center sm:p-4 ${won ? "border-gold/70" : "border-line"}`}>
      <CoverArt variant={side?.art ?? 0} className="size-20 rounded-lg sm:size-24" />
      {side ? (
        <Link href={side.href} className="mt-3 line-clamp-2 font-medium hover:underline">
          {side.title}
        </Link>
      ) : (
        <span className="mt-3 text-mist">Removed</span>
      )}
      {side?.artist && <span className="truncate text-sm text-mist">{side.artist}</span>}
      {show && (
        <span className="mt-2 inline-flex items-center gap-1 font-display text-2xl font-semibold tabular-nums">
          {won && <Crown size={18} className="text-gold" aria-label="Winner" />}
          {pct}%
        </span>
      )}
      {mine && <span className="mt-1 text-xs text-gold">Your vote</span>}
    </div>
  );
}

/** A Versus battle. Vote to see: results show once you have voted or the battle has closed. */
export function BattleCard({ battle: b, viewerId, back, label, linkTitle = true }: { battle: Battle; viewerId: string | null; back: string; label?: string; linkTitle?: boolean }) {
  const show = !!b.viewerSide || b.closed;
  const [pa, pb] = split(b.a_votes, b.b_votes);
  const total = b.a_votes + b.b_votes;
  const names: [string, string] = [b.a?.title ?? "Side A", b.b?.title ?? "Side B"];
  const line = show ? splitLine(names, [b.a_home, b.b_home], [b.a_diaspora, b.b_diaspora]) : null;
  const heading = b.title ?? `${names[0]} v ${names[1]}`;
  return (
    <article className="rounded-2xl border border-line bg-ink p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-mist">
        <span className="text-gold">{label ?? "Versus"}</span>
        <span>{b.closed ? "Closed" : timeLeft(b.closes_at)}</span>
      </div>
      <h3 className="mt-1 font-display text-lg font-semibold">
        {linkTitle ? (
          <Link href={`/versus/${b.id}`} className="hover:underline">
            {heading}
          </Link>
        ) : (
          heading
        )}
      </h3>

      <div className="mt-4 flex items-stretch gap-3">
        <SideBlock side={b.a} pct={pa} won={b.closed && b.winner === "a"} mine={b.viewerSide === "a"} show={show} />
        <span className="self-center font-display text-sm text-mist">v</span>
        <SideBlock side={b.b} pct={pb} won={b.closed && b.winner === "b"} mine={b.viewerSide === "b"} show={show} />
      </div>

      {show ? (
        <div className="mt-4">
          <div className="flex h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div className="bg-emerald-bright" style={{ width: `${pa}%` }} />
            <div className="bg-orange" style={{ width: `${pb}%` }} />
          </div>
          {line && <p className="mt-3 text-sm">{line}</p>}
        </div>
      ) : viewerId ? (
        <form action={voteBattleAction} className="mt-4 grid grid-cols-2 gap-3">
          <input type="hidden" name="battle_id" value={b.id} />
          <input type="hidden" name="back" value={back} />
          <SubmitButton name="side" value="a" className="btn-quiet" pendingLabel="Voting…">
            Vote {names[0]}
          </SubmitButton>
          <SubmitButton name="side" value="b" className="btn-quiet" pendingLabel="Voting…">
            Vote {names[1]}
          </SubmitButton>
        </form>
      ) : (
        <Link href="/signin" className="btn-quiet mt-4 w-full">
          Sign in to vote and see results
        </Link>
      )}

      <p className="mt-3 text-xs text-mist">{show ? plural(total, "vote") : "One vote each. Results show after you vote."}</p>
    </article>
  );
}
