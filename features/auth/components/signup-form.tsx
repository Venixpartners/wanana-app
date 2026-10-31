"use client";

import { useActionState } from "react";
import { signUpAction, type AuthState } from "../actions";
import { PasswordField } from "./password-field";
import { FormError, SentNotice } from "./notice";

export function SignUpForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUpAction, { status: "idle" });

  if (state.status === "sent") {
    return (
      <SentNotice title="Confirm your email">
        We sent a confirmation link to <span className="text-paper">{state.email}</span>. Open it to finish creating your account.
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
      <PasswordField autoComplete="new-password" hint="At least 8 characters, with a letter and a number." />
      <FormError message={state.status === "error" ? state.message : undefined} />
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
