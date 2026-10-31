import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";

/** Signed in user with a finished profile. Sends everyone else to sign in or onboarding. */
export async function requireMember() {
  const viewer = await getViewer();
  if (!viewer.userId) redirect("/signin");
  if (!viewer.profile) redirect("/onboarding");
  return viewer as typeof viewer & { userId: string; profile: NonNullable<typeof viewer.profile> };
}
