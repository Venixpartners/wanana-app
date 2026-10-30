"use client";

import { useActionState } from "react";
import { createProfile, type ProfileState } from "./actions";

export function ProfileForm({ countrySelect }: { countrySelect: React.ReactNode }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(createProfile, { status: "idle" });
  const err = (f: string) =>
    state.status === "error" && state.field === f ? (
      <p role="alert" className="mt-1.5 text-sm text-orange">
        {state.message}
      </p>
    ) : null;

  return (
    <form action={action} className="grid gap-5">
      <div>
        <label htmlFor="handle" className="label">
          Handle
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist">@</span>
          <input id="handle" name="handle" required minLength={3} maxLength={20} autoComplete="username" className="field pl-8" placeholder="yourname" />
        </div>
        {err("handle")}
      </div>
      <div>
        <label htmlFor="display_name" className="label">
          Name shown on your reviews
        </label>
        <input id="display_name" name="display_name" required maxLength={40} autoComplete="name" className="field" />
        {err("display_name")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className="label">
            Country
          </label>
          {countrySelect}
          {err("country")}
        </div>
        <div>
          <label htmlFor="city" className="label">
            City <span className="text-mist/70">(optional)</span>
          </label>
          <input id="city" name="city" maxLength={60} autoComplete="address-level2" className="field" placeholder="Lagos, London, Houston…" />
          {err("city")}
        </div>
      </div>
      <p className="text-sm text-mist">
        Your country and city tell us whether a rating comes from home or the diaspora. We only ever show them as totals, never next to your name unless you choose to.
      </p>
      {state.status === "error" && !state.field && (
        <p role="alert" className="text-sm text-orange">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Saving…" : "Create my profile"}
      </button>
    </form>
  );
}
