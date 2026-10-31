import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/lib/supabase/server";
import { countryName } from "@/lib/countries";
import { Avatar } from "@/features/profile/components/avatar";
import { countReviews } from "@/features/reviews/queries";
import { followState, followingCount } from "@/features/follows/queries";
import { ProfileActivity } from "@/features/community/components/profile-activity";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "Your profile" };

export default async function MePage({ searchParams }: { searchParams: Promise<{ password?: string }> }) {
  const { userId, email, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");
  const { password } = await searchParams;

  const [counts, follow, following] = await Promise.all([countReviews(userId), followState({ userId }, null), followingCount(userId)]);
  const joined = new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const place = [profile.city, countryName(profile.country_code)].filter(Boolean).join(", ");

  return (
    <>
      <SiteHeader />
      <SiteNav />
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
          <div className="flex gap-2 self-start sm:self-center">
            <Link href={`/u/${profile.handle}`} className="btn-quiet">
              Public profile
            </Link>
            <Link href="/settings/profile" className="btn-quiet">
              Edit profile
            </Link>
          </div>
        </div>
        {profile.bio && <p className="mt-6 max-w-xl leading-relaxed">{profile.bio}</p>}

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            ["Ratings", counts.ratings],
            ["Reviews", counts.reviews],
            ["Followers", follow.followers],
            ["Following", following],
          ].map(([label, n]) => (
            <div key={label} className="rounded-xl border border-line bg-ink p-4 sm:p-5">
              <p className="font-display text-2xl font-semibold tabular-nums sm:text-3xl">{Number(n).toLocaleString("en-GB")}</p>
              <p className="mt-1 text-sm text-mist">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-mist">Early Ear badges arrive with Wanana Charts.</p>

        <ProfileActivity authorId={userId} viewerId={userId} path="/me" own />

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
