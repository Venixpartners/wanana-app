import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";

export type SubjectKind = "artist" | "release" | "track";
export type Subject = { kind: SubjectKind; id: string; slug: string; name: string };
export type SubjectColumns = { artist_id?: string | null; release_id?: string | null; track_id?: string | null };

const PATH: Record<SubjectKind, string> = { artist: "/artist/", release: "/album/", track: "/song/" };
const TABLE: Record<SubjectKind, "artists" | "releases" | "tracks"> = { artist: "artists", release: "releases", track: "tracks" };
export const KIND_WORD: Record<SubjectKind, string> = { artist: "artist", release: "release", track: "song" };

export function subjectHref(s: Pick<Subject, "kind" | "slug">) {
  return `${PATH[s.kind]}${s.slug}`;
}

/** Which subject a row points at, if any. */
export function subjectOf(row: SubjectColumns): { kind: SubjectKind; id: string } | null {
  if (row.artist_id) return { kind: "artist", id: row.artist_id };
  if (row.release_id) return { kind: "release", id: row.release_id };
  if (row.track_id) return { kind: "track", id: row.track_id };
  return null;
}

/** Column values for inserting a row about a subject. */
export function subjectColumns(s: { kind: SubjectKind; id: string } | null): Required<SubjectColumns> {
  return {
    artist_id: s?.kind === "artist" ? s.id : null,
    release_id: s?.kind === "release" ? s.id : null,
    track_id: s?.kind === "track" ? s.id : null,
  };
}

export function readSubjectField(form: FormData): { kind: SubjectKind; id: string } | null {
  const kind = String(form.get("subject_kind") ?? "");
  const id = String(form.get("subject_id") ?? "");
  if ((kind === "artist" || kind === "release" || kind === "track") && isUuid(id)) return { kind, id };
  return null;
}

/** Looks up names and slugs for a set of rows' subjects, keyed "kind:id". */
export async function resolveSubjects(rows: SubjectColumns[]): Promise<Map<string, Subject>> {
  const want: Record<SubjectKind, Set<string>> = { artist: new Set(), release: new Set(), track: new Set() };
  for (const r of rows) {
    const s = subjectOf(r);
    if (s) want[s.kind].add(s.id);
  }
  const supabase = await createClient();
  const out = new Map<string, Subject>();
  await Promise.all(
    (Object.keys(want) as SubjectKind[]).map(async (kind) => {
      const ids = Array.from(want[kind]);
      if (!ids.length) return;
      const nameCol = kind === "artist" ? "name" : "title";
      const { data } = await supabase.from(TABLE[kind]).select(`id, slug, ${nameCol}`).in("id", ids);
      for (const r of (data ?? []) as unknown as Record<string, string>[]) {
        out.set(`${kind}:${r.id}`, { kind, id: r.id, slug: r.slug, name: r[nameCol] });
      }
    }),
  );
  return out;
}

export function subjectFor(map: Map<string, Subject>, row: SubjectColumns): Subject | null {
  const s = subjectOf(row);
  return s ? (map.get(`${s.kind}:${s.id}`) ?? null) : null;
}

/** Reads ?artist=slug, ?release=slug or ?track=slug into a subject. */
export async function subjectFromSlug(params: { artist?: string; release?: string; track?: string }): Promise<Subject | null> {
  const kind: SubjectKind | null = params.artist ? "artist" : params.release ? "release" : params.track ? "track" : null;
  if (!kind) return null;
  const slug = params[kind]!;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  const supabase = await createClient();
  const nameCol = kind === "artist" ? "name" : "title";
  const { data } = await supabase.from(TABLE[kind]).select(`id, slug, ${nameCol}`).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const r = data as unknown as Record<string, string>;
  return { kind, id: r.id, slug: r.slug, name: r[nameCol] };
}
