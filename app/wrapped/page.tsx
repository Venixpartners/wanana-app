import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import { currentMonthKey } from "@/features/wrapped/periods";

/** Your own Wrapped for this month. */
export default async function MyWrapped() {
  const { userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");
  redirect(`/wrapped/${profile.handle}/${currentMonthKey()}`);
}
