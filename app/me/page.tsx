import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/lib/supabase/server";
import { countryName } from "@/lib/countries";

export const metadata: Metadata = { title: "Your profile" };

export default async function MePage() {
  const { userId, email, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");

  const joined = new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const place = [profile.city, countryName(profile.country_code)].filter(Boolean).join(", ");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-mist">@{profile.handle}</p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">{profile.display_name}</h1>
        <p className="mt-3 text-mist">
          {place} · <span className={profile.audience === "home" ? "text-emerald-bright" : "text-gold"}>{profile.audience === "home" ? "Home" : "Diaspora"}</span> · Joined {joined}
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {["Ratings", "Reviews", "Early Ear calls"].map((label) => (
            <div key={label} className="rounded-xl border border-line bg-ink p-5">
              <p className="font-display text-3xl font-semibold">0</p>
              <p className="mt-1 text-sm text-mist">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-mist">Song pages and ratings open in the next build. Your taste history will show here.</p>

        <div className="mt-16 flex items-center justify-between border-t border-line pt-6 text-sm text-mist">
          <span>Signed in as {email}</span>
          <form action="/auth/signout" method="post">
            <button className="btn-quiet">Sign out</button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
