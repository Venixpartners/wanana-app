"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";
import { fieldErrors } from "@/features/profile/schema";
import { writeError } from "@/features/community/errors";
import { refreshFrom } from "@/features/community/refresh";
import { readSubjectField, subjectColumns } from "@/features/community/subjects";
import { commentSchema, reviewSchema } from "./schema";

export type ReviewState = { status: "idle" | "error" | "saved"; message?: string; fields?: Record<string, string>; nonce?: number };

async function member() {
  const viewer = await getViewer();
  if (!viewer.userId) redirect("/signin");
  if (!viewer.profile) redirect("/onboarding");
  return viewer as typeof viewer & { userId: string };
}

/** Adds or updates the viewer's one review of a subject. */
export async function saveReviewAction(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const { supabase, userId } = await member();
  const subject = readSubjectField(form);
  if (!subject) return { status: "error", message: "We couldn't tell what you're reviewing." };
  const parsed = reviewSchema.safeParse({ rating: form.get("rating") ?? "", title: String(form.get("title") ?? ""), body: String(form.get("body") ?? "") });
  if (!parsed.success) return { status: "error", fields: fieldErrors(parsed.error.issues) };

  const existing = String(form.get("review_id") ?? "");
  const { error } = isUuid(existing)
    ? await supabase.from("reviews").update(parsed.data).eq("id", existing).eq("author_id", userId)
    : await supabase.from("reviews").insert({ author_id: userId, ...subjectColumns(subject), ...parsed.data });
  if (error) return { status: "error", message: writeError(error) };
  refreshFrom(form);
  return { status: "saved", message: parsed.data.body ? "Your review is posted." : "Your rating is saved.", nonce: Date.now() };
}

export async function deleteReviewAction(form: FormData) {
  const { supabase } = await member();
  const id = String(form.get("id") ?? "");
  if (isUuid(id)) await supabase.from("reviews").delete().eq("id", id);
  const back = refreshFrom(form);
  redirect(back);
}

export async function commentAction(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const { supabase, userId } = await member();
  const review_id = String(form.get("review_id") ?? "");
  if (!isUuid(review_id)) return { status: "error", message: "We couldn't find that review." };
  const parsed = commentSchema.safeParse({ body: String(form.get("body") ?? "") });
  if (!parsed.success) return { status: "error", fields: fieldErrors(parsed.error.issues) };
  const { error } = await supabase.from("review_comments").insert({ review_id, author_id: userId, body: parsed.data.body });
  if (error) return { status: "error", message: writeError(error) };
  refreshFrom(form, `/reviews/${review_id}`);
  return { status: "saved", nonce: Date.now() };
}

export async function deleteCommentAction(form: FormData) {
  const { supabase } = await member();
  const id = String(form.get("id") ?? "");
  if (isUuid(id)) await supabase.from("review_comments").delete().eq("id", id);
  refreshFrom(form);
}
