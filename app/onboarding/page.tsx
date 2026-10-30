import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CountrySelect } from "@/components/country-select";
import { getViewer } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const { supabase, userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (profile) redirect("/me");

  const { data: legacy } = await supabase.rpc("is_legacy", { uid: userId });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-16">
        {legacy ? (
          <>
            <h1 className="font-display text-3xl font-semibold tracking-tight">This email belongs to the old Wanana</h1>
            <p className="mt-4 leading-relaxed text-mist">
              Accounts from the earlier Wanana beta don't carry over to the new platform. Please sign out and join again with a different email address.
            </p>
            <form action="/auth/signout" method="post" className="mt-8">
              <button className="btn">Sign out</button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Set up your profile</h1>
            <p className="mb-8 mt-2 text-mist">This is how other fans will see you on Wanana.</p>
            <ProfileForm countrySelect={<CountrySelect name="country" id="country" required />} />
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
