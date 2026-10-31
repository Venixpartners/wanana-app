"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { avatarUrlPrefix, fieldErrors, profileSchema } from "./schema";

export type ProfileState = { status: "idle" | "error" | "saved"; message?: string; fields?: Record<string, string> };

function readProfile(form: FormData) {
  return profileSchema.safeParse({
    handle: String(form.get("handle") ?? ""),
    display_name: String(form.get("display_name") ?? ""),
    country_code: String(form.get("country_code") ?? ""),
    city: String(form.get("city") ?? ""),
    bio: String(form.get("bio") ?? ""),
  });
}

export async function createProfileAction(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const { supabase, userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (profile) redirect("/me");

  const parsed = readProfile(form);
  if (!parsed.success) return { status: "error", fields: fieldErrors(parsed.error.issues) };

  const { error } = await supabase.from("profiles").insert({ id: userId, ...parsed.data });
  if (error) {
    if (error.code === "23505") return { status: "error", fields: { handle: `@${parsed.data.handle} is taken. Try another.` } };
    console.error("create profile failed", error.code, error.message);
    return { status: "error", message: "We couldn't save your profile. Please try again." };
  }
  redirect("/me");
}

export async function updateProfileAction(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const { supabase, userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");

  const parsed = readProfile(form);
  if (!parsed.success) return { status: "error", fields: fieldErrors(parsed.error.issues) };

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", userId);
  if (error) {
    if (error.code === "23505") return { status: "error", fields: { handle: `@${parsed.data.handle} is taken. Try another.` } };
    console.error("update profile failed", error.code, error.message);
    return { status: "error", message: "We couldn't save your changes. Please try again." };
  }
  revalidatePath("/me");
  return { status: "saved", message: "Profile saved." };
}

/** Called after the browser has uploaded the photo to the user's own storage folder. */
export async function setAvatarAction(url: string | null): Promise<{ ok: boolean; message?: string }> {
  const { supabase, userId } = await getViewer();
  if (!userId) return { ok: false, message: "Sign in again to change your photo." };
  if (url !== null && !url.startsWith(avatarUrlPrefix(SUPABASE_URL, userId))) {
    return { ok: false, message: "That photo couldn't be saved." };
  }
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  if (error) return { ok: false, message: "That photo couldn't be saved." };
  revalidatePath("/me");
  return { ok: true };
}
