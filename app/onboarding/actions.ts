"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import { isCountryCode } from "@/lib/countries";

export type ProfileState = { status: "idle" | "error"; message?: string; field?: string };

const HANDLE = /^[a-z0-9_]{3,20}$/;

export async function createProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const { supabase, userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (profile) redirect("/me");

  const handle = String(form.get("handle") ?? "").trim().toLowerCase().replace(/^@/, "");
  const displayName = String(form.get("display_name") ?? "").trim();
  const country = String(form.get("country") ?? "").trim().toUpperCase();
  const city = String(form.get("city") ?? "").trim();

  if (!HANDLE.test(handle)) {
    return { status: "error", field: "handle", message: "Use 3 to 20 lowercase letters, numbers or underscores." };
  }
  if (displayName.length < 1 || displayName.length > 40) {
    return { status: "error", field: "display_name", message: "Your name should be between 1 and 40 characters." };
  }
  if (!isCountryCode(country)) return { status: "error", field: "country", message: "Please choose your country." };
  if (city.length > 60) return { status: "error", field: "city", message: "That city name is too long." };

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    handle,
    display_name: displayName,
    country_code: country,
    city: city || null,
  });

  if (error) {
    if (error.code === "23505") return { status: "error", field: "handle", message: `@${handle} is taken. Try another.` };
    console.error("create profile failed", error.code, error.message);
    return { status: "error", message: "We couldn't save your profile. Please try again." };
  }
  redirect("/me");
}
