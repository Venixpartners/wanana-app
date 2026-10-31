"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type AuthState } from "../actions";
import { PasswordField } from "./password-field";
import { FormError, SentNotice } from "./notice";

export function SignInForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signInAction, { status: "idle" });

  if (state.status === "sent") {
    return (
      <SentNotice title="Check your inbox">
        We sent a sign in link to <span className="text-paper">{state.email}</span>. It works once and expires in an hour.
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
      <PasswordField autoComplete="current-password" />
      <div className="-mt-1 text-right text-sm">
        <Link href="/forgot-password" className="text-mist underline-offset-4 hover:text-paper hover:underline">
          Forgot your password?
        </Link>
      </div>
      <FormError message={state.status === "error" ? state.message : undefined} />
      <button type="submit" name="intent" value="password" disabled={pending} className="btn">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <button type="submit" name="intent" value="link" disabled={pending} className="btn-quiet py-3">
        Email me a sign in link instead
      </button>
    </form>
  );
}
