"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type AuthState } from "../actions";
import { FormError, SentNotice } from "./notice";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordResetAction, { status: "idle" });

  if (state.status === "sent") {
    return (
      <SentNotice title="Check your inbox">
        If there's a Wanana account for <span className="text-paper">{state.email}</span>, a link to reset your password is on its way.
      </SentNotice>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={state.email} className="field" placeholder="you@example.com" />
      </div>
      <FormError message={state.status === "error" ? state.message : undefined} />
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
