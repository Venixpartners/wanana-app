"use client";

import { useActionState } from "react";
import { sendSignInLink, type SignInState } from "./actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(sendSignInLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-xl border border-emerald/60 bg-emerald/10 p-6">
        <p className="font-display text-lg font-semibold">Check your inbox</p>
        <p className="mt-1 text-mist">
          We sent a sign in link to <span className="text-paper">{state.email}</span>. It works once and expires in an hour.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" placeholder="you@example.com" />
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-orange">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Sending…" : "Email me a sign in link"}
      </button>
      <p className="text-sm text-mist">No password needed. New here? The same link creates your account.</p>
    </form>
  );
}
