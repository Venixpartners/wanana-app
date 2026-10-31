"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { fieldErrors } from "@/features/profile/schema";
import { artistSchema, formToObject, readLinks, releaseSchema, trackSchema } from "./schema";
import { slugify, withSuffix } from "./slug";

export type EditorState = { status: "idle" | "error"; message?: string; fields?: Record<string, string> };

type Table = "artists" | "releases" | "tracks";
type Db = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/** A slug nobody else is using. Tries name, name-2, name-3 and so on. */
async function freeSlug(supabase: Db, table: Table, base: string, selfId: string | null, max: number) {
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? base : withSuffix(base, n, max);
    let q = supabase.from(table).select("id").eq("slug", candidate);
    if (selfId) q = q.neq("id", selfId);
    const { data } = await q.limit(1);
    if (!data?.length) return candidate;
  }
  return withSuffix(base, Date.now() % 100000, max);
}

function dbError(error: { code?: string; message: string }): EditorState {
  if (error.code === "23505") {
    if (error.message.includes("isrc")) return { status: "error", fields: { isrc: "Another song already has this ISRC." } };
    if (error.message.includes("upc")) return { status: "error", fields: { upc: "Another release already has this UPC." } };
    return { status: "error", fields: { slug: "That address is taken. Try another." } };
  }
  console.error("catalogue save failed", error.code, error.message);
  return { status: "error", message: "We couldn't save this. Please try again." };
}

function idFrom(form: FormData) {
  const id = String(form.get("id") ?? "");
  return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

export async function saveArtistAction(_prev: EditorState, form: FormData): Promise<EditorState> {
  const { supabase, userId } = await requireAdmin();
  const id = idFrom(form);
  const parsed = artistSchema.safeParse(formToObject(form, ["name", "slug", "country_code", "genres", "summary"]));
  const { links, errors } = readLinks(form);
  if (!parsed.success || Object.keys(errors).length) {
    return { status: "error", fields: { ...(parsed.success ? {} : fieldErrors(parsed.error.issues)), ...errors } };
  }
  const { slug: wanted, ...rest } = parsed.data;
  const slug = await freeSlug(supabase, "artists", wanted ?? slugify(rest.name, 80), id, 80);
  const row = { ...rest, slug, links };

  const res = id
    ? await supabase.from("artists").update(row).eq("id", id).select("slug").single()
    : await supabase.from("artists").insert({ ...row, created_by: userId }).select("slug").single();
  if (res.error) return dbError(res.error);
  revalidatePath(`/artist/${res.data.slug}`);
  redirect(`/admin/catalogue?saved=artist&slug=${res.data.slug}`);
}

export async function saveReleaseAction(_prev: EditorState, form: FormData): Promise<EditorState> {
  const { supabase, userId } = await requireAdmin();
  const id = idFrom(form);
  const parsed = releaseSchema.safeParse(formToObject(form, ["title", "slug", "artist_id", "kind", "release_date", "label", "upc"]));
  const { links, errors } = readLinks(form);
  if (!parsed.success || Object.keys(errors).length) {
    return { status: "error", fields: { ...(parsed.success ? {} : fieldErrors(parsed.error.issues)), ...errors } };
  }
  const { slug: wanted, ...rest } = parsed.data;
  const { data: artist } = await supabase.from("artists").select("slug").eq("id", rest.artist_id).maybeSingle();
  if (!artist) return { status: "error", fields: { artist_id: "Choose the artist." } };
  const slug = await freeSlug(supabase, "releases", wanted ?? slugify(`${artist.slug} ${rest.title}`, 100), id, 100);
  const row = { ...rest, slug, links };

  const res = id
    ? await supabase.from("releases").update(row).eq("id", id).select("slug").single()
    : await supabase.from("releases").insert({ ...row, created_by: userId }).select("slug").single();
  if (res.error) return dbError(res.error);
  revalidatePath(`/album/${res.data.slug}`);
  revalidatePath(`/artist/${artist.slug}`);
  redirect(`/admin/catalogue?saved=release&slug=${res.data.slug}`);
}

export async function saveTrackAction(_prev: EditorState, form: FormData): Promise<EditorState> {
  const { supabase, userId } = await requireAdmin();
  const id = idFrom(form);
  const raw = formToObject(form, ["title", "slug", "artist_id", "release_id", "track_number", "isrc", "duration", "release_date"]);
  raw.featured_ids = form.getAll("featured_ids").map(String).filter(Boolean);
  const parsed = trackSchema.safeParse(raw);
  const { links, errors } = readLinks(form);
  if (!parsed.success || Object.keys(errors).length) {
    return { status: "error", fields: { ...(parsed.success ? {} : fieldErrors(parsed.error.issues)), ...errors } };
  }
  const { slug: wanted, featured_ids, duration, ...rest } = parsed.data;
  const { data: artist } = await supabase.from("artists").select("slug").eq("id", rest.artist_id).maybeSingle();
  if (!artist) return { status: "error", fields: { artist_id: "Choose the main artist." } };
  if (rest.release_id) {
    const { data: rel } = await supabase.from("releases").select("artist_id").eq("id", rest.release_id).maybeSingle();
    if (!rel) return { status: "error", fields: { release_id: "Choose a release from the list." } };
  }
  const slug = await freeSlug(supabase, "tracks", wanted ?? slugify(`${artist.slug} ${rest.title}`, 120), id, 120);
  const row = { ...rest, slug, links, duration_seconds: duration };

  const res = id
    ? await supabase.from("tracks").update(row).eq("id", id).select("id, slug").single()
    : await supabase.from("tracks").insert({ ...row, created_by: userId }).select("id, slug").single();
  if (res.error) return dbError(res.error);

  // Replace the featured artists list. The main artist can't also be featured.
  const trackId = res.data.id;
  const guests = Array.from(new Set(featured_ids)).filter((g) => g !== rest.artist_id);
  const { error: delErr } = await supabase.from("track_artists").delete().eq("track_id", trackId);
  if (!delErr && guests.length) {
    await supabase.from("track_artists").insert(guests.map((artist_id) => ({ track_id: trackId, artist_id, role: "featured" })));
  }

  revalidatePath(`/song/${res.data.slug}`);
  revalidatePath(`/artist/${artist.slug}`);
  redirect(`/admin/catalogue?saved=song&slug=${res.data.slug}`);
}
