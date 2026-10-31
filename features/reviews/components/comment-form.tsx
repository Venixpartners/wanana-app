"use client";

import { useActionState } from "react";
import { commentAction, type ReviewState } from "../actions";

export function CommentForm({ reviewId, back }: { reviewId: string; back: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(commentAction, { status: "idle" });
  const error = state.fields?.body ?? state.message;
  return (
    <form key={state.nonce ?? 0} action={action} className="grid gap-3" noValidate>
      <input type="hidden" name="review_id" value={reviewId} />
      <input type="hidden" name="back" value={back} />
      <label htmlFor="comment" className="sr-only">
        Your comment
      </label>
      <textarea id="comment" name="body" rows={3} maxLength={2000} className="field" placeholder="Add a comment" />
      {error && state.status === "error" && <p role="alert" className="text-sm text-orange">{error}</p>}
      <button type="submit" disabled={pending} className="btn justify-self-start">
        {pending ? "Posting…" : "Comment"}
      </button>
    </form>
  );
}
