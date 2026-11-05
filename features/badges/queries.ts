import { createClient } from "@/lib/supabase/server";
import type { BadgeKey } from "./badges";

/** Badges for a set of people, keyed by user id. */
export async function badgesFor(ids: string[]): Promise<Map<string, BadgeKey[]>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const out = new Map<string, BadgeKey[]>();
  if (!unique.length) return out;
  const supabase = await createClient();
  const { data } = await supabase.from("badges").select("user_id, badge").in("user_id", unique);
  for (const r of (data ?? []) as { user_id: string; badge: BadgeKey }[]) out.set(r.user_id, [...(out.get(r.user_id) ?? []), r.badge]);
  return out;
}

export type Invites = { friends_joined: number; needed: number; founding_until: string; has_badge: boolean };

export async function myInvites(): Promise<Invites | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_invites");
  if (error) console.error("my_invites failed", error.code, error.message);
  return ((data ?? []) as Invites[])[0] ?? null;
}
