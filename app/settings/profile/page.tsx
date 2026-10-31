import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CountrySelect } from "@/components/country-select";
import { getViewer } from "@/lib/supabase/server";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { AvatarUpload } from "@/features/profile/components/avatar-upload";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const { userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-12 sm:px-6 sm:py-16">
        <Link href="/me" className="text-sm text-mist hover:text-paper">
          Back to your profile
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Edit profile</h1>
        <div className="my-8">
          <AvatarUpload userId={userId} name={profile.display_name} url={profile.avatar_url} />
        </div>
        <ProfileForm
          mode="edit"
          initial={profile}
          countrySelect={<CountrySelect name="country_code" id="country_code" defaultValue={profile.country_code} />}
        />
        <div className="mt-12 border-t border-line pt-6 text-sm text-mist">
          <Link href="/forgot-password" className="underline underline-offset-4 hover:text-paper">
            Change your password
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
