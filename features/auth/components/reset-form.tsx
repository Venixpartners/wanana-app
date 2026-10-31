"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthState } from "../actions";
import { PasswordField } from "./password-field";
import { FormError } from "./notice";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePasswordAction, { status: "idle" });
  return (
    <form action={action} className="grid gap-4" noValidate>
      <PasswordField label="New password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." />
      <FormError message={state.status === "error" ? state.message : undefined} />
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
