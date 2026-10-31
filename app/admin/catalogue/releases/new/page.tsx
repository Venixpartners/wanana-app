import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { ReleaseEditor } from "@/features/catalogue/admin/release-editor";
import { artistOptions } from "@/features/catalogue/admin/options";

export const metadata: Metadata = { title: "Add release", robots: { index: false } };

export default async function NewRelease() {
  const { supabase } = await requireAdmin();
  const artists = await artistOptions(supabase);
  return (
    <AdminShell title="Add release" back={{ href: "/admin/catalogue", label: "Back to catalogue" }}>
      {artists.length === 0 ? <p className="text-mist">Add an artist first, then come back to add their release.</p> : <ReleaseEditor artists={artists} />}
    </AdminShell>
  );
}
