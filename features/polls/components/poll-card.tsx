import Link from "next/link";
import { plural, timeAgo } from "@/lib/text";
import { SubjectChip } from "@/features/community/components/subject-chip";
import { SubmitButton } from "@/features/community/components/submit-button";
import { voteAction } from "../actions";
import { percentages } from "../schema";
import type { PollItem } from "../queries";

function closingText(p: PollItem) {
  if (p.closed) return "Closed";
  if (!p.closes_at) return "Open";
  const days = Math.ceil((new Date(p.closes_at).getTime() - Date.now()) / 86_400_000);
  return days <= 1 ? "Closes within a day" : `Closes in ${days} days`;
}

/** Signed in fans vote first and see results after. Everyone else sees results. */
export function PollCard({ poll, viewerId, back, linkTitle = true }: { poll: PollItem; viewerId: string | null; back: string; linkTitle?: boolean }) {
  const showResults = !viewerId || !!poll.viewerVote || poll.closed;
  const pct = percentages(poll.options.map((o) => o.vote_count));
  const top = Math.max(...poll.options.map((o) => o.vote_count), 0);
  return (
    <article className="rounded-2xl border border-line bg-ink p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-mist">
        <SubjectChip subject={poll.subject} genre={poll.genre} />
        <span>{closingText(poll)}</span>
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold">
        {linkTitle ? (
          <Link href={`/polls/${poll.id}`} className="hover:underline">
            {poll.question}
          </Link>
        ) : (
          poll.question
        )}
      </h3>
      {showResults ? (
        <ul className="mt-4 grid gap-2">
          {poll.options.map((o, i) => {
            const mine = poll.viewerVote === o.id;
            const leading = poll.vote_count > 0 && o.vote_count === top;
            return (
              <li key={o.id} className="relative overflow-hidden rounded-lg border border-line">
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 ${leading ? "bg-emerald/35" : "bg-line/70"}`} style={{ width: `${pct[i]}%` }} />
                <span className="relative flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate">
                    {o.label}
                    {mine && <span className="ml-2 text-xs text-gold">Your vote</span>}
                  </span>
                  <span className="tabular-nums">{pct[i]}%</span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <form action={voteAction} className="mt-4 grid gap-2">
          <input type="hidden" name="poll_id" value={poll.id} />
          <input type="hidden" name="back" value={back} />
          <fieldset className="grid gap-2">
            <legend className="sr-only">{poll.question}</legend>
            {poll.options.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm hover:border-mist has-[:checked]:border-emerald">
                <input type="radio" name="option_id" value={o.id} required className="accent-[#0E7C66]" />
                {o.label}
              </label>
            ))}
          </fieldset>
          <SubmitButton className="btn-quiet mt-1 justify-self-start" pendingLabel="Voting…">
            Vote
          </SubmitButton>
        </form>
      )}
      <p className="mt-3 text-xs text-mist">
        {plural(poll.vote_count, "vote")}. Asked by {poll.author ? `@${poll.author.handle}` : "a former member"} {timeAgo(poll.created_at)}.
        {!viewerId && " Sign in to vote."}
      </p>
    </article>
  );
}
