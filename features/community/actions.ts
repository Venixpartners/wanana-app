"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";
import { refreshFrom } from "./refresh";
import { writeError } from "./errors";

const TOGGLES = {
  discussion_like: { table: "discussion_likes", target: "discussion_id", who: "user_id" },
  reply_like: { table: "reply_likes", target: "reply_id", who: "user_id" },
  review_helpful: { table: "review_helpful", target: "review_id", who: "user_id" },
  follow_artist: { table: "follows", target: "artist_id", who: "follower_id" },
  follow_user: { table: "follows", target: "user_id", who: "follower_id" },
} as const;
export type ToggleKind = keyof typeof TOGGLES;

/** Like, helpful and follow buttons. "on" is the state the button showed when pressed. */
export async function toggleAction(form: FormData) {
  const { supabase, userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");
  const kind = String(form.get("what")) as ToggleKind;
  const id = String(form.get("id") ?? "");
  const t = TOGGLES[kind];
  if (!t || !isUuid(id)) return;

  const { error } =
    form.get("on") === "1"
      ? await supabase.from(t.table).delete().eq(t.target, id).eq(t.who, userId)
      : await supabase.from(t.table).insert({ [t.target]: id, [t.who]: userId } as never);
  if (error && error.code !== "23505") writeError(error);
  refreshFrom(form);
}

export type ReportState = { status: "idle" | "error" | "sent"; message?: string };
const TARGETS = ["discussion", "reply", "review", "review_comment", "poll", "ranking", "profile"];
const REASONS = ["spam", "abuse", "hate", "harassment", "misinformation", "other"];

export async function reportAction(_prev: ReportState, form: FormData): Promise<ReportState> {
  const { supabase, userId, profile } = await getViewer();
  if (!userId || !profile) return { status: "error", message: "Sign in to report this." };
  const target_type = String(form.get("target_type"));
  const target_id = String(form.get("target_id"));
  const reason = String(form.get("reason"));
  const note = String(form.get("note") ?? "").trim().slice(0, 500) || null;
  if (!TARGETS.includes(target_type) || !isUuid(target_id)) return { status: "error", message: "We couldn't send this report." };
  if (!REASONS.includes(reason)) return { status: "error", message: "Choose a reason." };

  const { error } = await supabase.from("reports").insert({ reporter_id: userId, target_type, target_id, reason, note });
  if (error && error.code !== "23505") return { status: "error", message: writeError(error) };
  return { status: "sent", message: "Thanks. A moderator will look at this." };
}
