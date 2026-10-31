import { createClient } from "@/lib/supabase/server";

export type Person = { id: string; handle: string; display_name: string; avatar_url: string | null; audience: "home" | "diaspora" | null };

export async function peopleByIds(ids: (string | null | undefined)[]): Promise<Map<string, Person>> {
  const unique = Array.from(new Set(ids.filter((i): i is string => !!i)));
  if (!unique.length) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, handle, display_name, avatar_url, audience").in("id", unique);
  return new Map((data ?? []).map((p) => [p.id, p as Person]));
}
