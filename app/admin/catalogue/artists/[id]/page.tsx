import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { CountrySelect } from "@/components/country-select";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { ArtistEditor } from "@/features/catalogue/admin/artist-editor";

export const metadata: Metadata = { title: "Edit artist", robots: { index: false } };

export default async function EditArtist({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: artist } = await supabase.from("artists").select("id, name, slug, country_code, genres, summary, links, is_published").eq("id", id).maybeSingle();
  if (!artist) notFound();
  return (
    <AdminShell title={`Edit ${artist.name}`} back={{ href: "/admin/catalogue", label: "Back to catalogue" }}>
      <p className="-mt-4 mb-8 text-sm">
        <Link href={`/artist/${artist.slug}`} className="text-mist underline underline-offset-4 hover:text-paper">
          View public page
        </Link>
      </p>
      <ArtistEditor initial={artist} countrySelect={<CountrySelect name="country_code" id="country_code" defaultValue={artist.country_code ?? ""} />} />
    </AdminShell>
  );
}
