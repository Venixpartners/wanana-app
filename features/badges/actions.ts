"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/text";

/** Admins can grant or remove a badge from a public profile. */
export async function setBadgeAction(form: FormData) {
  const { supabase } = await requireAdmin();
  const user = String(form.get("user_id") ?? "");
  const badge = String(form.get("badge") ?? "");
  const on = form.get("on") === "1";
  const handle = String(form.get("handle") ?? "");
  if (!isUuid(user) || (badge !== "voice" && badge !== "founding_fan")) return;
  const { error } = await supabase.rpc("set_badge", { p_user: user, p_badge: badge, p_on: on });
  if (error) console.error("set_badge failed", error.code, error.message);
  if (/^[a-z0-9_]{3,20}$/.test(handle)) revalidatePath(`/u/${handle}`);
}
