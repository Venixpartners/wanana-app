import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: "music" },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** Signed in user and their Wanana profile, or nulls. */
export async function getViewer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (!userId) return { supabase, userId: null, email: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name, city, country_code, audience, role, bio, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();
  return { supabase, userId, email: (data?.claims?.email as string) ?? null, profile };
}
