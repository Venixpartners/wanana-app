"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SHARE_CHANNELS, isShareCode, shareKindOf, type ShareChannel } from "./links";

const REF_COOKIE = "wanana_ref";

/** Records a share. Fire and forget from the share menu; a failure never blocks the share itself. */
export async function recordShareAction(code: string, path: string, channel: ShareChannel) {
  const kind = shareKindOf(path);
  if (!isShareCode(code) || !kind || !SHARE_CHANNELS.includes(channel) || path.length > 200 || !path.startsWith("/")) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_share", { p_code: code, p_kind: kind, p_target: path, p_channel: channel });
  if (error && error.code !== "P0001") console.error("record_share failed", error.code, error.message);
}

/** Counts a tap on a shared link and remembers the code for 30 days, so a sign up can be credited to it. */
export async function openShareAction(code: string) {
  if (!isShareCode(code)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_share_open", { p_code: code });
  if (error) console.error("record_share_open failed", error.code, error.message);
  const jar = await cookies();
  if (!jar.get(REF_COOKIE)) jar.set(REF_COOKIE, code, { maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax", secure: true, path: "/" });
}

/** Called once a new fan finishes their profile. */
export async function claimShareSignup() {
  const jar = await cookies();
  const code = jar.get(REF_COOKIE)?.value;
  if (!isShareCode(code)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_share_signup", { p_code: code });
  if (error) console.error("claim_share_signup failed", error.code, error.message);
  jar.delete(REF_COOKIE);
}
