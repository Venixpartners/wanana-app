import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { TrackEditor } from "@/features/catalogue/admin/track-editor";
import { artistOptions, releaseOptions } from "@/features/catalogue/admin/options";

export const metadata: Metadata = { title: "Edit song", robots: { index: false } };

export default async function EditSong({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data: track }, { data: feats }, artists, releases] = await Promise.all([
    supabase.from("tracks").select("id, title, slug, artist_id, release_id, track_number, isrc, duration_seconds, release_date, links, is_published").eq("id", id).maybeSingle(),
    supabase.from("track_artists").select("artist_id").eq("track_id", id),
    artistOptions(supabase),
    releaseOptions(supabase),
  ]);
  if (!track) notFound();
  return (
    <AdminShell title={`Edit ${track.title}`} back={{ href: "/admin/catalogue", label: "Back to catalogue" }}>
      <p className="-mt-4 mb-8 text-sm">
        <Link href={`/song/${track.slug}`} className="text-mist underline underline-offset-4 hover:text-paper">
          View public page
        </Link>
      </p>
      <TrackEditor initial={{ ...track, featured_ids: (feats ?? []).map((f) => f.artist_id) }} artists={artists} releases={releases} />
    </AdminShell>
  );
}
