import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { CountrySelect } from "@/components/country-select";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { ArtistEditor } from "@/features/catalogue/admin/artist-editor";

export const metadata: Metadata = { title: "Add artist", robots: { index: false } };

export default async function NewArtist() {
  await requireAdmin();
  return (
    <AdminShell title="Add artist" back={{ href: "/admin/catalogue", label: "Back to catalogue" }}>
      <ArtistEditor countrySelect={<CountrySelect name="country_code" id="country_code" />} />
    </AdminShell>
  );
}
