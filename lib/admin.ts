import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";

/** Admin pages: signed out visitors go to sign in, everyone else who isn't an admin sees a plain 404. */
export async function requireAdmin() {
  const viewer = await getViewer();
  if (!viewer.userId) redirect("/signin");
  if (viewer.profile?.role !== "admin") notFound();
  return viewer as typeof viewer & { userId: string };
}
