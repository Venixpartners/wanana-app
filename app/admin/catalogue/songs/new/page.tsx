import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { TrackEditor } from "@/features/catalogue/admin/track-editor";
import { artistOptions, releaseOptions } from "@/features/catalogue/admin/options";

export const metadata: Metadata = { title: "Add song", robots: { index: false } };

export default async function NewSong() {
  const { supabase } = await requireAdmin();
  const [artists, releases] = await Promise.all([artistOptions(supabase), releaseOptions(supabase)]);
  return (
    <AdminShell title="Add song" back={{ href: "/admin/catalogue", label: "Back to catalogue" }}>
      {artists.length === 0 ? <p className="text-mist">Add an artist first, then come back to add their songs.</p> : <TrackEditor artists={artists} releases={releases} />}
    </AdminShell>
  );
}
