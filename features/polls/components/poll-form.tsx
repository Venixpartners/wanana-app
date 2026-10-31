"use client";

import { useActionState, useState } from "react";
import { createPollAction, type PollState } from "../actions";
import { DURATIONS } from "../schema";

export function PollForm({ subject }: { subject?: { kind: string; id: string; name: string } | null }) {
  const [state, action, pending] = useActionState<PollState, FormData>(createPollAction, { status: "idle" });
  const [count, setCount] = useState(2);
  const f = state.fields ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      {subject && (
        <>
          <input type="hidden" name="subject_kind" value={subject.kind} />
          <input type="hidden" name="subject_id" value={subject.id} />
        </>
      )}
      <div>
        <label htmlFor="question" className="label">
          Question
        </label>
        <input id="question" name="question" maxLength={200} className="field" placeholder={subject ? `Best song by ${subject.name}?` : "Best Afrobeats album of the year so far?"} />
        {f.question && <p role="alert" className="mt-1.5 text-sm text-orange">{f.question}</p>}
      </div>
      <fieldset className="grid gap-3">
        <legend className="label">Choices</legend>
        {Array.from({ length: count }, (_, i) => (
          <input key={i} name="option" maxLength={80} aria-label={`Choice ${i + 1}`} className="field" placeholder={`Choice ${i + 1}`} />
        ))}
        {count < 6 && (
          <button type="button" onClick={() => setCount((c) => c + 1)} className="btn-quiet justify-self-start">
            Add a choice
          </button>
        )}
        {f.options && <p role="alert" className="text-sm text-orange">{f.options}</p>}
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="days" className="label">
            How long
          </label>
          <select id="days" name="days" defaultValue="7" className="field appearance-none">
            {DURATIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {!subject && (
          <div>
            <label htmlFor="genre" className="label">
              Genre (optional)
            </label>
            <input id="genre" name="genre" maxLength={40} className="field" />
          </div>
        )}
      </div>
      <p className="text-xs text-mist">Polls are for opinions only. No prizes, bets or stakes of any kind.</p>
      {state.message && <p role="alert" className="text-sm text-orange">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn sm:justify-self-start">
        {pending ? "Posting…" : "Post the poll"}
      </button>
    </form>
  );
}
