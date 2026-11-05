"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/text";
import { writeError } from "@/features/community/errors";
import { refreshFrom } from "@/features/community/refresh";
import { slugify } from "@/features/catalogue/slug";

export async function voteBattleAction(form: FormData) {
  const viewer = await getViewer();
  if (!viewer.userId) redirect("/signin");
  if (!viewer.profile) redirect("/onboarding");
  const battle_id = String(form.get("battle_id") ?? "");
  const side = String(form.get("side") ?? "");
  if (isUuid(battle_id) && (side === "a" || side === "b")) {
    const { error } = await viewer.supabase.from("battle_votes").insert({ battle_id, user_id: viewer.userId, side });
    if (error && error.code !== "23505") writeError(error);
  }
  refreshFrom(form, `/versus/${battle_id}`);
}

export type AdminVersusState = { status: "idle" | "error"; message?: string };

/** Admins type song or release addresses (the part after /song/ or /album/), one per line. */
function readSlugs(raw: string) {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim().replace(/^.*\/(song|album)\//, "").replace(/[?#].*$/, "").toLowerCase())
    .filter(Boolean);
}

async function idsFor(kind: "track" | "release", slugs: string[]) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from(kind === "track" ? "tracks" : "releases").select("id, slug, is_published").in("slug", slugs);
  const bySlug = new Map((data ?? []).map((r) => [r.slug as string, r as { id: string; is_published: boolean }]));
  const missing = slugs.filter((s) => !bySlug.get(s)?.is_published);
  return { ids: slugs.map((s) => bySlug.get(s)?.id).filter((v): v is string => !!v), missing };
}

const MESSAGES: Record<string, string> = {
  battle_sides: "Both sides need to be published, and different.",
  bracket_size: "A bracket needs 4, 8 or 16 different entries.",
  battle_hours: "Rounds run between 12 and 168 hours.",
};
function adminError(error: { code?: string; message?: string }) {
  for (const [k, v] of Object.entries(MESSAGES)) if (error.message?.includes(k)) return v;
  if (error.code === "23505") return "That bracket address is taken. Try another title.";
  return writeError(error);
}

function readKind(form: FormData): "track" | "release" {
  return form.get("kind") === "release" ? "release" : "track";
}
function readHours(form: FormData) {
  const h = Number(form.get("hours"));
  return Number.isFinite(h) ? Math.round(h) : 48;
}

export async function createBattleAction(_prev: AdminVersusState, form: FormData): Promise<AdminVersusState> {
  const { supabase } = await requireAdmin();
  const kind = readKind(form);
  const slugs = readSlugs(`${form.get("a") ?? ""}\n${form.get("b") ?? ""}`);
  if (slugs.length !== 2) return { status: "error", message: "Add both sides." };
  const { ids, missing } = await idsFor(kind, slugs);
  if (missing.length) return { status: "error", message: `Not found or not published: ${missing.join(", ")}` };
  const { data, error } = await supabase.rpc("create_battle", { p_kind: kind, p_a: ids[0], p_b: ids[1], p_title: String(form.get("title") ?? "") || null, p_hours: readHours(form) });
  if (error) return { status: "error", message: adminError(error) };
  revalidatePath("/versus");
  redirect(`/versus/${data}`);
}

export async function createBracketAction(_prev: AdminVersusState, form: FormData): Promise<AdminVersusState> {
  const { supabase } = await requireAdmin();
  const kind = readKind(form);
  const title = String(form.get("title") ?? "").trim();
  if (title.length < 3) return { status: "error", message: "Give the bracket a title." };
  const slugs = readSlugs(String(form.get("entries") ?? ""));
  const { ids, missing } = await idsFor(kind, slugs);
  if (missing.length) return { status: "error", message: `Not found or not published: ${missing.join(", ")}` };
  const slug = slugify(title, 70) || "bracket";
  const { error } = await supabase.rpc("create_bracket", {
    p_slug: slug,
    p_title: title,
    p_kind: kind,
    p_ids: ids,
    p_description: String(form.get("description") ?? "") || null,
    p_hours: readHours(form),
  });
  if (error) return { status: "error", message: adminError(error) };
  revalidatePath("/versus");
  redirect(`/versus/bracket/${slug}`);
}
