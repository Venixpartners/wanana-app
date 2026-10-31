"use client";

import { useActionState, useState } from "react";
import { saveReviewAction, type ReviewState } from "../actions";

type Existing = { id: string; rating: number; title: string | null; body: string | null } | null;

export function ReviewForm({ subject, existing, back }: { subject: { kind: string; id: string; name: string }; existing: Existing; back: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(saveReviewAction, { status: "idle" });
  const [score, setScore] = useState<number | null>(existing?.rating ?? null);
  const f = state.fields ?? {};
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-line bg-ink p-5" noValidate>
      <input type="hidden" name="subject_kind" value={subject.kind} />
      <input type="hidden" name="subject_id" value={subject.id} />
      <input type="hidden" name="back" value={back} />
      {existing && <input type="hidden" name="review_id" value={existing.id} />}
      <fieldset>
        <legend className="font-display font-semibold">{existing ? "Your score" : `Rate ${subject.name}`}</legend>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} checked={score === n} onChange={() => setScore(n)} className="peer sr-only" />
              <span className="flex h-11 items-center justify-center rounded-lg border border-line text-sm tabular-nums transition peer-checked:border-emerald peer-checked:bg-emerald peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-gold hover:border-mist">
                {n}
              </span>
            </label>
          ))}
        </div>
        {f.rating && <p role="alert" className="mt-2 text-sm text-orange">{f.rating}</p>}
      </fieldset>
      <details open={!!existing?.body || !!f.body || !!f.title}>
        <summary className="cursor-pointer text-sm text-mist hover:text-paper">Add a written review (optional)</summary>
        <div className="mt-3 grid gap-3">
          <label htmlFor="review-title" className="sr-only">
            Headline
          </label>
          <input id="review-title" name="title" maxLength={120} defaultValue={existing?.title ?? ""} className="field" placeholder="Headline" />
          {f.title && <p role="alert" className="text-sm text-orange">{f.title}</p>}
          <label htmlFor="review-body" className="sr-only">
            Your review
          </label>
          <textarea id="review-body" name="body" rows={5} maxLength={5000} defaultValue={existing?.body ?? ""} className="field" placeholder="What works, what doesn't, how it hits" />
          {f.body && <p role="alert" className="text-sm text-orange">{f.body}</p>}
        </div>
      </details>
      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"} className={`text-sm ${state.status === "error" ? "text-orange" : "text-emerald-bright"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn justify-self-start">
        {pending ? "Saving…" : existing ? "Update" : "Save"}
      </button>
    </form>
  );
}
