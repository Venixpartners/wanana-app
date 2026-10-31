"use client";

import { useActionState } from "react";
import { reportAction, type ReportState } from "../actions";

const REASONS: [string, string][] = [
  ["spam", "Spam or advertising"],
  ["abuse", "Abuse or insults"],
  ["hate", "Hate, including ethnic or religious abuse"],
  ["harassment", "Harassment or stan war pile on"],
  ["misinformation", "False information"],
  ["other", "Something else"],
];

export function ReportButton({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [state, action, pending] = useActionState<ReportState, FormData>(reportAction, { status: "idle" });
  if (state.status === "sent") return <p className="text-sm text-mist">{state.message}</p>;
  return (
    <details className="group text-sm">
      <summary className="cursor-pointer list-none text-mist hover:text-paper">Report</summary>
      <form action={action} className="mt-3 grid max-w-sm gap-3 rounded-xl border border-line bg-ink p-4">
        <input type="hidden" name="target_type" value={targetType} />
        <input type="hidden" name="target_id" value={targetId} />
        <label className="label" htmlFor={`reason-${targetId}`}>
          What's wrong?
        </label>
        <select id={`reason-${targetId}`} name="reason" defaultValue="" className="field appearance-none" required>
          <option value="" disabled>
            Choose a reason
          </option>
          {REASONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <textarea name="note" rows={2} maxLength={500} placeholder="Anything else we should know (optional)" className="field" />
        {state.message && (
          <p role="alert" className="text-orange">
            {state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-quiet justify-self-start">
          {pending ? "Sending…" : "Send report"}
        </button>
      </form>
    </details>
  );
}
