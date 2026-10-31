import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CountrySelect } from "@/components/country-select";
import { getViewer } from "@/lib/supabase/server";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const { userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (profile) redirect("/me");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Set up your profile</h1>
        <p className="mb-8 mt-2 text-mist">This is how other fans will see you on Wanana. You can add a photo once you're in.</p>
        <ProfileForm mode="create" countrySelect={<CountrySelect name="country_code" id="country_code" />} />
      </main>
      <SiteFooter />
    </>
  );
}
