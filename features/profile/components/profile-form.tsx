"use client";

import { useActionState, useState } from "react";
import { createProfileAction, updateProfileAction, type ProfileState } from "../actions";

type Initial = { handle?: string; display_name?: string; country_code?: string; city?: string | null; bio?: string | null };

export function ProfileForm({ mode, initial = {}, countrySelect }: { mode: "create" | "edit"; initial?: Initial; countrySelect: React.ReactNode }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(mode === "create" ? createProfileAction : updateProfileAction, {
    status: "idle",
  });
  const [bioLength, setBioLength] = useState(initial.bio?.length ?? 0);
  const err = (f: string) =>
    state.fields?.[f] ? (
      <p role="alert" className="mt-1.5 text-sm text-orange">
        {state.fields[f]}
      </p>
    ) : null;

  return (
    <form action={action} className="grid gap-5" noValidate>
      <div>
        <label htmlFor="handle" className="label">
          Handle
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist">@</span>
          <input id="handle" name="handle" defaultValue={initial.handle} maxLength={21} autoComplete="username" className="field pl-8" placeholder="yourname" />
        </div>
        {err("handle")}
      </div>
      <div>
        <label htmlFor="display_name" className="label">
          Name shown on your reviews
        </label>
        <input id="display_name" name="display_name" defaultValue={initial.display_name} maxLength={40} autoComplete="name" className="field" />
        {err("display_name")}
      </div>
      <div>
        <label htmlFor="bio" className="label">
          Bio <span className="text-mist/70">(optional)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={160}
          defaultValue={initial.bio ?? ""}
          onChange={(e) => setBioLength(e.target.value.length)}
          className="field resize-none"
          placeholder="What you listen to, who you'll defend in any argument."
        />
        <p className="mt-1 text-right text-xs text-mist">{bioLength}/160</p>
        {err("bio")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="country_code" className="label">
            Country
          </label>
          {countrySelect}
          {err("country_code")}
        </div>
        <div>
          <label htmlFor="city" className="label">
            City <span className="text-mist/70">(optional)</span>
          </label>
          <input id="city" name="city" defaultValue={initial.city ?? ""} maxLength={60} autoComplete="address-level2" className="field" placeholder="Lagos, London, Houston…" />
          {err("city")}
        </div>
      </div>
      {mode === "create" && (
        <p className="text-sm text-mist">
          Your country tells us whether a rating comes from home or the diaspora. We only ever show it as part of totals, never next to your name unless you choose to.
        </p>
      )}
      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"} className={`text-sm ${state.status === "error" ? "text-orange" : "text-emerald-bright"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Saving…" : mode === "create" ? "Create my profile" : "Save changes"}
      </button>
    </form>
  );
}
