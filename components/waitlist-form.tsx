"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions";

const initial: WaitlistState = { status: "idle" };

export function WaitlistForm({ countrySelect }: { countrySelect: React.ReactNode }) {
  const [state, action, pending] = useActionState(joinWaitlist, initial);

  if (state.status === "done") {
    return (
      <div role="status" className="rounded-xl border border-emerald/60 bg-emerald/10 p-6">
        <p className="font-display text-lg font-semibold">You're on the list.</p>
        <p className="mt-1 text-mist">We'll email you the day Wanana opens. Tell a friend who argues about music as much as you do.</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="field" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="country" className="label">
            Where you listen from
          </label>
          {countrySelect}
        </div>
        <div>
          <label htmlFor="interest" className="label">
            I'm joining as
          </label>
          <select id="interest" name="interest" defaultValue="fan" className="field appearance-none">
            <option value="fan">A fan</option>
            <option value="artist">An artist or artist team</option>
            <option value="industry">Label, media or brand</option>
          </select>
        </div>
      </div>
      <input type="text" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-orange">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "Adding you…" : "Join the waitlist"}
      </button>
    </form>
  );
}
