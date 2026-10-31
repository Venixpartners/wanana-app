"use client";

import { useActionState } from "react";
import { replyAction, type FormState } from "../actions";

export function ReplyForm({ discussionId, parentId, back, compact = false }: { discussionId: string; parentId?: string; back: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(replyAction, { status: "idle" });
  const error = state.fields?.body ?? state.message;
  return (
    // The key clears the box after each successful reply.
    <form key={state.nonce ?? 0} action={action} className="grid gap-3" noValidate>
      <input type="hidden" name="discussion_id" value={discussionId} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <input type="hidden" name="back" value={back} />
      <label htmlFor={`reply-${parentId ?? "top"}`} className="sr-only">
        Your reply
      </label>
      <textarea id={`reply-${parentId ?? "top"}`} name="body" rows={compact ? 2 : 3} maxLength={3000} className="field" placeholder="Add your reply" />
      {error && <p role="alert" className="text-sm text-orange">{error}</p>}
      <button type="submit" disabled={pending} className={compact ? "btn-quiet justify-self-start" : "btn justify-self-start"}>
        {pending ? "Posting…" : "Reply"}
      </button>
    </form>
  );
}
