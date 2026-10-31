import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/lib/supabase/server";
import { countryName } from "@/lib/countries";
import { Avatar } from "@/features/profile/components/avatar";

export const metadata: Metadata = { title: "Your profile" };

export default async function MePage({ searchParams }: { searchParams: Promise<{ password?: string }> }) {
  const { userId, email, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");
  const { password } = await searchParams;

  const joined = new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const place = [profile.city, countryName(profile.country_code)].filter(Boolean).join(", ");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        {password === "updated" && (
          <p role="status" className="mb-8 rounded-lg border border-emerald/60 bg-emerald/10 p-3 text-sm">
            Your password has been changed.
          </p>
        )}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={profile.display_name} url={profile.avatar_url} size={96} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{profile.display_name}</h1>
            <p className="mt-1 text-mist">@{profile.handle}</p>
            <p className="mt-2 text-sm text-mist">
              {place}, <span className={profile.audience === "home" ? "text-emerald-bright" : "text-gold"}>{profile.audience === "home" ? "home" : "diaspora"}</span>. Joined {joined}.
            </p>
          </div>
          <Link href="/settings/profile" className="btn-quiet self-start sm:self-center">
            Edit profile
          </Link>
        </div>
        {profile.bio && <p className="mt-6 max-w-xl leading-relaxed">{profile.bio}</p>}

        <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
          {["Ratings", "Reviews", "Early Ear"].map((label) => (
            <div key={label} className="rounded-xl border border-line bg-ink p-4 sm:p-5">
              <p className="font-display text-2xl font-semibold sm:text-3xl">0</p>
              <p className="mt-1 text-sm text-mist">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-mist">Song pages and ratings open in the next build. Your taste history will show here.</p>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
          <span className="truncate">Signed in as {email}</span>
          <form action="/auth/signout" method="post">
            <button className="btn-quiet">Sign out</button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
