import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { artVariant } from "@/features/catalogue/slug";
import { isUuid } from "@/lib/text";

export type Side = { id: string; slug: string; title: string; artist: string | null; href: string; art: number };
export type BattleRow = {
  id: string;
  title: string | null;
  kind: "track" | "release";
  a_id: string;
  b_id: string;
  bracket_id: string | null;
  round: number | null;
  slot: number | null;
  opens_at: string;
  closes_at: string;
  a_votes: number;
  b_votes: number;
  a_home: number;
  a_diaspora: number;
  b_home: number;
  b_diaspora: number;
  winner: "a" | "b" | null;
};
export type Battle = BattleRow & { a: Side | null; b: Side | null; viewerSide: "a" | "b" | null; closed: boolean };
export type Bracket = { id: string; slug: string; title: string; description: string | null; kind: "track" | "release"; size: number; round_hours: number; current_round: number; status: "running" | "done"; winner_id: string | null; created_at: string };

const COLS = "id, title, kind, a_id, b_id, bracket_id, round, slot, opens_at, closes_at, a_votes, b_votes, a_home, a_diaspora, b_home, b_diaspora, winner";
const BRACKET = "id, slug, title, description, kind, size, round_hours, current_round, status, winner_id, created_at";

/** Song or release names, slugs and artists for battle sides. */
async function resolveSides(rows: { kind: "track" | "release"; ids: string[] }[]): Promise<Map<string, Side>> {
  const supabase = await createClient();
  const out = new Map<string, Side>();
  const tracks = Array.from(new Set(rows.filter((r) => r.kind === "track").flatMap((r) => r.ids)));
  const releases = Array.from(new Set(rows.filter((r) => r.kind === "release").flatMap((r) => r.ids)));
  const [{ data: t }, { data: r }] = await Promise.all([
    tracks.length ? supabase.from("tracks").select("id, slug, title, artist_id, release_id").in("id", tracks) : Promise.resolve({ data: [] }),
    releases.length ? supabase.from("releases").select("id, slug, title, artist_id").in("id", releases) : Promise.resolve({ data: [] }),
  ]);
  const trackRows = (t ?? []) as { id: string; slug: string; title: string; artist_id: string; release_id: string | null }[];
  const releaseRows = (r ?? []) as { id: string; slug: string; title: string; artist_id: string }[];
  const artistIds = Array.from(new Set([...trackRows, ...releaseRows].map((x) => x.artist_id)));
  const { data: artists } = artistIds.length ? await supabase.from("artists").select("id, name").in("id", artistIds) : { data: [] };
  const name = new Map(((artists ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));
  for (const x of trackRows) out.set(x.id, { id: x.id, slug: x.slug, title: x.title, artist: name.get(x.artist_id) ?? null, href: `/song/${x.slug}`, art: artVariant(x.slug) });
  for (const x of releaseRows) out.set(x.id, { id: x.id, slug: x.slug, title: x.title, artist: name.get(x.artist_id) ?? null, href: `/album/${x.slug}`, art: artVariant(x.slug) });
  return out;
}

async function decorate(rows: BattleRow[], viewerId: string | null): Promise<Battle[]> {
  if (!rows.length) return [];
  const supabase = await createClient();
  const [sides, votes] = await Promise.all([
    resolveSides(rows.map((r) => ({ kind: r.kind, ids: [r.a_id, r.b_id] }))),
    viewerId ? supabase.from("battle_votes").select("battle_id, side").eq("user_id", viewerId).in("battle_id", rows.map((r) => r.id)) : Promise.resolve({ data: [] }),
  ]);
  const mine = new Map(((votes.data ?? []) as { battle_id: string; side: "a" | "b" }[]).map((v) => [v.battle_id, v.side]));
  const now = Date.now();
  return rows.map((r) => ({ ...r, a: sides.get(r.a_id) ?? null, b: sides.get(r.b_id) ?? null, viewerSide: mine.get(r.id) ?? null, closed: new Date(r.closes_at).getTime() <= now }));
}

/** Open battles, soonest to close first, or recently closed ones. */
export async function listBattles(opts: { open: boolean; limit?: number; viewerId: string | null }) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  let q = supabase.from("battles").select(COLS);
  q = opts.open ? q.lte("opens_at", now).gt("closes_at", now).order("closes_at", { ascending: true }) : q.lte("closes_at", now).order("closes_at", { ascending: false });
  const { data } = await q.limit(opts.limit ?? 12).returns<BattleRow[]>();
  return decorate(data ?? [], opts.viewerId);
}

export const getBattle = cache(async (id: string, viewerId: string | null) => {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("battles").select(COLS).eq("id", id).maybeSingle<BattleRow>();
  if (!data) return null;
  const [battle] = await decorate([data], viewerId);
  let bracket: Bracket | null = null;
  if (data.bracket_id) {
    const { data: b } = await supabase.from("brackets").select(BRACKET).eq("id", data.bracket_id).maybeSingle<Bracket>();
    bracket = b;
  }
  return { battle, bracket };
});

export async function listBrackets(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase.from("brackets").select(BRACKET).order("created_at", { ascending: false }).limit(limit).returns<Bracket[]>();
  return data ?? [];
}

export const getBracket = cache(async (slug: string, viewerId: string | null) => {
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data: bracket } = await supabase.from("brackets").select(BRACKET).eq("slug", slug).maybeSingle<Bracket>();
  if (!bracket) return null;
  const { data } = await supabase.from("battles").select(COLS).eq("bracket_id", bracket.id).order("round").order("slot").returns<BattleRow[]>();
  const battles = await decorate(data ?? [], viewerId);
  const champion = bracket.winner_id ? ((await resolveSides([{ kind: bracket.kind, ids: [bracket.winner_id] }])).get(bracket.winner_id) ?? null) : null;
  return { bracket, battles, champion };
});
