"use server";

import { createClient } from "@/lib/supabase/server";
import { waitlistSchema } from "./schema";

export type WaitlistState = { status: "idle" | "done" | "error"; message?: string };

export async function joinWaitlist(_prev: WaitlistState, form: FormData): Promise<WaitlistState> {
  // Bots fill the hidden field; people never see it.
  if (String(form.get("company_site") ?? "")) return { status: "done" };

  const parsed = waitlistSchema.safeParse({
    email: String(form.get("email") ?? ""),
    country: String(form.get("country") ?? ""),
    interest: String(form.get("interest") ?? "fan"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_waitlist", {
    p_email: parsed.data.email,
    p_country: parsed.data.country,
    p_interest: parsed.data.interest,
    p_source: "coming_soon",
  });

  if (error) {
    console.error("join_waitlist failed", error.message);
    return { status: "error", message: "Something went wrong on our side. Please try again in a minute." };
  }
  return { status: "done" };
}
