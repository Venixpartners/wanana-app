"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/features/community/components/submit-button";
import { Field } from "@/features/catalogue/admin/fields";
import { createBattleAction, createBracketAction, type AdminVersusState } from "../actions";

const idle: AdminVersusState = { status: "idle" };

function Kind() {
  return (
    <Field name="kind" label="Songs or releases">
      <select id="kind" name="kind" className="field" defaultValue="track">
        <option value="track">Songs</option>
        <option value="release">Albums, EPs and singles</option>
      </select>
    </Field>
  );
}

function Hours({ label }: { label: string }) {
  return (
    <Field name="hours" label={label} hint="Between 12 and 168. 48 is two days.">
      <input id="hours" name="hours" type="number" min={12} max={168} defaultValue={48} className="field" />
    </Field>
  );
}

function Problem({ state }: { state: AdminVersusState }) {
  return state.status === "error" ? (
    <p role="alert" className="text-sm text-orange">
      {state.message}
    </p>
  ) : null;
}

export function BattleForm() {
  const [state, action] = useActionState(createBattleAction, idle);
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-line bg-ink p-5">
      <Kind />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="a" label="First side" hint="The address after /song/ or /album/, or paste the link.">
          <input id="a" name="a" required className="field" placeholder="ojuelegba" />
        </Field>
        <Field name="b" label="Second side">
          <input id="b" name="b" required className="field" placeholder="essence" />
        </Field>
      </div>
      <Field name="title" label="Headline (optional)" hint="Leave blank to use the two names.">
        <input id="title" name="title" maxLength={120} className="field" />
      </Field>
      <Hours label="Hours open" />
      <Problem state={state} />
      <SubmitButton className="btn justify-self-start" pendingLabel="Starting…">
        Start battle
      </SubmitButton>
    </form>
  );
}

export function BracketForm() {
  const [state, action] = useActionState(createBracketAction, idle);
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-line bg-ink p-5">
      <Field name="title" label="Bracket title">
        <input id="title" name="title" required minLength={3} maxLength={120} className="field" placeholder="Song of the Summer 2026" />
      </Field>
      <Field name="description" label="Description (optional)">
        <input id="description" name="description" maxLength={500} className="field" />
      </Field>
      <Kind />
      <Field name="entries" label="Entries" hint="4, 8 or 16, one per line. They're paired in order: first v second, third v fourth.">
        <textarea id="entries" name="entries" required rows={8} className="field font-mono text-sm" />
      </Field>
      <Hours label="Hours per round" />
      <Problem state={state} />
      <SubmitButton className="btn justify-self-start" pendingLabel="Starting…">
        Start bracket
      </SubmitButton>
    </form>
  );
}
