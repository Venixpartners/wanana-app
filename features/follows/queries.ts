import { createClient } from "@/lib/supabase/server";

export async function followState(target: { artistId?: string; userId?: string }, viewerId: string | null) {
  const supabase = await createClient();
  const col = target.artistId ? "artist_id" : "user_id";
  const id = (target.artistId ?? target.userId)!;
  const [{ count }, mine] = await Promise.all([
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq(col, id),
    viewerId ? supabase.from("follows").select("follower_id").eq(col, id).eq("follower_id", viewerId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  return { followers: count ?? 0, following: !!mine.data };
}

export async function followingCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("follower_id", userId);
  return count ?? 0;
}

export async function followedArtistIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("follows").select("artist_id").eq("follower_id", userId).not("artist_id", "is", null).limit(500);
  return (data ?? []).map((r) => r.artist_id as string);
}
