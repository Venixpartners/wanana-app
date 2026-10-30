"use server";

import { createClient } from "@/lib/supabase/server";
import { isCountryCode } from "@/lib/countries";

export type WaitlistState = { status: "idle" | "done" | "error"; message?: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const INTERESTS = ["fan", "artist", "industry"];

export async function joinWaitlist(_prev: WaitlistState, form: FormData): Promise<WaitlistState> {
  // Bots fill the hidden field; people never see it.
  if (String(form.get("company_site") ?? "")) return { status: "done" };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const country = String(form.get("country") ?? "").trim().toUpperCase();
  const interest = String(form.get("interest") ?? "fan");

  if (!EMAIL.test(email) || email.length > 254) {
    return { status: "error", message: "That email address doesn't look right." };
  }
  if (country && !isCountryCode(country)) {
    return { status: "error", message: "Please choose your country from the list." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_waitlist", {
    p_email: email,
    p_country: country || null,
    p_interest: INTERESTS.includes(interest) ? interest : "fan",
    p_source: "coming_soon",
  });

  if (error) {
    console.error("join_waitlist failed", error.message);
    return { status: "error", message: "Something went wrong on our side. Please try again in a minute." };
  }
  return { status: "done" };
}
