"use client";

import { useActionState } from "react";
import { createDiscussionAction, type FormState } from "../actions";

export function DiscussionForm({ subject }: { subject?: { kind: string; id: string; name: string } | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createDiscussionAction, { status: "idle" });
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
        <label htmlFor="title" className="label">
          Title
        </label>
        <input id="title" name="title" maxLength={140} className="field" placeholder={subject ? `What do you think of ${subject.name}?` : "What's on your mind?"} />
        {f.title && <p role="alert" className="mt-1.5 text-sm text-orange">{f.title}</p>}
      </div>
      <div>
        <label htmlFor="body" className="label">
          Your thoughts
        </label>
        <textarea id="body" name="body" rows={7} maxLength={5000} className="field" />
        {f.body && <p role="alert" className="mt-1.5 text-sm text-orange">{f.body}</p>}
      </div>
      {!subject && (
        <div>
          <label htmlFor="genre" className="label">
            Genre (optional)
          </label>
          <input id="genre" name="genre" maxLength={40} className="field" placeholder="Afrobeats, Amapiano, Highlife…" />
          {f.genre && <p role="alert" className="mt-1.5 text-sm text-orange">{f.genre}</p>}
        </div>
      )}
      <p className="text-xs text-mist">Disagree about the music, not the people. Abuse, hate and pile ons get removed.</p>
      {state.message && <p role="alert" className="text-sm text-orange">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn sm:justify-self-start">
        {pending ? "Posting…" : "Start the discussion"}
      </button>
    </form>
  );
}
