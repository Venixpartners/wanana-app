"use server";

import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";
import { fieldErrors } from "@/features/profile/schema";
import { writeError } from "@/features/community/errors";
import { parseItems, rankingSchema } from "./schema";

export type RankingState = { status: "idle" | "error"; message?: string; fields?: Record<string, string> };

async function member() {
  const viewer = await getViewer();
  if (!viewer.userId) redirect("/signin");
  if (!viewer.profile) redirect("/onboarding");
  return viewer as typeof viewer & { userId: string };
}

export async function saveRankingAction(_prev: RankingState, form: FormData): Promise<RankingState> {
  const { supabase } = await member();
  const id = String(form.get("id") ?? "");
  const parsed = rankingSchema.safeParse({
    title: String(form.get("title") ?? ""),
    description: String(form.get("description") ?? ""),
    is_public: form.get("is_public") === "on",
    items: parseItems(String(form.get("items") ?? "[]")),
  });
  if (!parsed.success) {
    const fields = fieldErrors(parsed.error.issues);
    // Errors inside one entry are shown with the list.
    for (const k of Object.keys(fields)) if (k.startsWith("items.")) fields.items ??= fields[k];
    return { status: "error", fields };
  }
  const { data, error } = await supabase.rpc("save_ranking", {
    p_id: isUuid(id) ? id : null,
    p_title: parsed.data.title,
    p_description: parsed.data.description ?? "",
    p_is_public: parsed.data.is_public,
    p_items: parsed.data.items.map(({ kind, id: itemId, note }) => ({ kind, id: itemId, note: note ?? null })),
  });
  if (error) return { status: "error", message: writeError(error) };
  redirect(`/rankings/${data}`);
}

export async function deleteRankingAction(form: FormData) {
  const { supabase } = await member();
  const id = String(form.get("id") ?? "");
  if (isUuid(id)) await supabase.from("rankings").delete().eq("id", id);
  redirect("/rankings");
}
