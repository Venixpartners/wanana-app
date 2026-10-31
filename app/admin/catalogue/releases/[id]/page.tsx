import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { ReleaseEditor } from "@/features/catalogue/admin/release-editor";
import { artistOptions } from "@/features/catalogue/admin/options";

export const metadata: Metadata = { title: "Edit release", robots: { index: false } };

export default async function EditRelease({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data: release }, artists] = await Promise.all([
    supabase.from("releases").select("id, title, slug, artist_id, kind, release_date, label, upc, links, is_published").eq("id", id).maybeSingle(),
    artistOptions(supabase),
  ]);
  if (!release) notFound();
  return (
    <AdminShell title={`Edit ${release.title}`} back={{ href: "/admin/catalogue", label: "Back to catalogue" }}>
      <p className="-mt-4 mb-8 text-sm">
        <Link href={`/album/${release.slug}`} className="text-mist underline underline-offset-4 hover:text-paper">
          View public page
        </Link>
      </p>
      <ReleaseEditor initial={release} artists={artists} />
    </AdminShell>
  );
}
