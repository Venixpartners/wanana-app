"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";
import { fieldErrors } from "@/features/profile/schema";
import { writeError } from "@/features/community/errors";
import { refreshFrom } from "@/features/community/refresh";
import { readSubjectField, subjectColumns } from "@/features/community/subjects";
import { discussionSchema, replySchema } from "./schema";

export type FormState = { status: "idle" | "error" | "saved"; message?: string; fields?: Record<string, string>; nonce?: number };

async function member() {
  const viewer = await getViewer();
  if (!viewer.userId) redirect("/signin");
  if (!viewer.profile) redirect("/onboarding");
  return viewer as typeof viewer & { userId: string };
}

export async function createDiscussionAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, userId } = await member();
  const parsed = discussionSchema.safeParse({ title: String(form.get("title") ?? ""), body: String(form.get("body") ?? ""), genre: String(form.get("genre") ?? "") });
  if (!parsed.success) return { status: "error", fields: fieldErrors(parsed.error.issues) };
  const subject = readSubjectField(form);
  const { data, error } = await supabase
    .from("discussions")
    .insert({ author_id: userId, title: parsed.data.title, body: parsed.data.body, genre: subject ? null : parsed.data.genre, ...subjectColumns(subject) })
    .select("id")
    .single();
  if (error) return { status: "error", message: writeError(error) };
  redirect(`/community/${data.id}`);
}

export async function replyAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, userId } = await member();
  const discussion_id = String(form.get("discussion_id") ?? "");
  const parent = String(form.get("parent_id") ?? "");
  if (!isUuid(discussion_id)) return { status: "error", message: "We couldn't find that discussion." };
  const parsed = replySchema.safeParse({ body: String(form.get("body") ?? "") });
  if (!parsed.success) return { status: "error", fields: fieldErrors(parsed.error.issues) };
  const { error } = await supabase
    .from("discussion_replies")
    .insert({ discussion_id, parent_id: isUuid(parent) ? parent : null, author_id: userId, body: parsed.data.body });
  if (error) return { status: "error", message: writeError(error) };
  refreshFrom(form, `/community/${discussion_id}`);
  return { status: "saved", nonce: Date.now() };
}

export async function deleteDiscussionAction(form: FormData) {
  const { supabase } = await member();
  const id = String(form.get("id") ?? "");
  if (isUuid(id)) await supabase.from("discussions").delete().eq("id", id);
  redirect("/community");
}

export async function deleteReplyAction(form: FormData) {
  const { supabase } = await member();
  const id = String(form.get("id") ?? "");
  if (isUuid(id)) await supabase.from("discussion_replies").delete().eq("id", id);
  refreshFrom(form, "/community");
}
