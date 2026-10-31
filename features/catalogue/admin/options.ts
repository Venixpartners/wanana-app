import type { requireAdmin } from "@/lib/admin";

type Db = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export async function artistOptions(supabase: Db) {
  const { data } = await supabase.from("artists").select("id, name").order("name").limit(2000);
  return (data ?? []) as { id: string; name: string }[];
}

export async function releaseOptions(supabase: Db) {
  const [{ data: releases }, artists] = await Promise.all([
    supabase.from("releases").select("id, title, artist_id").order("title").limit(2000),
    artistOptions(supabase),
  ]);
  const names = new Map(artists.map((a) => [a.id, a.name]));
  return (releases ?? []).map((r) => ({ id: r.id as string, name: `${r.title} (${names.get(r.artist_id) ?? "unknown artist"})` }));
}
