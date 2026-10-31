"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";
import { fieldErrors } from "@/features/profile/schema";
import { writeError } from "@/features/community/errors";
import { refreshFrom } from "@/features/community/refresh";
import { readSubjectField, subjectColumns } from "@/features/community/subjects";
import { closesAt, pollSchema } from "./schema";

export type PollState = { status: "idle" | "error"; message?: string; fields?: Record<string, string> };

async function member() {
  const viewer = await getViewer();
  if (!viewer.userId) redirect("/signin");
  if (!viewer.profile) redirect("/onboarding");
  return viewer as typeof viewer & { userId: string };
}

export async function createPollAction(_prev: PollState, form: FormData): Promise<PollState> {
  const { supabase } = await member();
  const parsed = pollSchema.safeParse({
    question: String(form.get("question") ?? ""),
    options: form.getAll("option").map(String),
    days: String(form.get("days") ?? ""),
    genre: String(form.get("genre") ?? ""),
  });
  if (!parsed.success) return { status: "error", fields: fieldErrors(parsed.error.issues) };
  const subject = readSubjectField(form);
  const cols = subjectColumns(subject);
  const { data, error } = await supabase.rpc("create_poll", {
    p_question: parsed.data.question,
    p_options: parsed.data.options,
    p_artist: cols.artist_id,
    p_release: cols.release_id,
    p_track: cols.track_id,
    p_genre: subject ? null : parsed.data.genre,
    p_closes_at: closesAt(parsed.data.days),
  });
  if (error) return { status: "error", message: writeError(error) };
  redirect(`/polls/${data}`);
}

export async function voteAction(form: FormData) {
  const { supabase, userId } = await member();
  const poll_id = String(form.get("poll_id") ?? "");
  const option_id = String(form.get("option_id") ?? "");
  if (isUuid(poll_id) && isUuid(option_id)) {
    const { error } = await supabase.from("poll_votes").insert({ poll_id, option_id, user_id: userId });
    if (error && error.code !== "23505") writeError(error);
  }
  refreshFrom(form, `/polls/${poll_id}`);
}

export async function deletePollAction(form: FormData) {
  const { supabase } = await member();
  const id = String(form.get("id") ?? "");
  if (isUuid(id)) await supabase.from("polls").delete().eq("id", id);
  redirect("/polls");
}
