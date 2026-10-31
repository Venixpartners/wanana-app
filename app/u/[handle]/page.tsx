import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { createClient, getViewer } from "@/lib/supabase/server";
import { countryName } from "@/lib/countries";
import { plural } from "@/lib/text";
import { Avatar } from "@/features/profile/components/avatar";
import { countReviews } from "@/features/reviews/queries";
import { followState, followingCount } from "@/features/follows/queries";
import { ToggleButton } from "@/features/community/components/toggle-button";
import { ReportButton } from "@/features/community/components/report-button";
import { ShareButton } from "@/features/community/components/share-button";
import { ProfileActivity } from "@/features/community/components/profile-activity";

type Props = { params: Promise<{ handle: string }> };

async function findProfile(raw: string) {
  const handle = raw.toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, handle, display_name, city, country_code, audience, avatar_url, bio, created_at").eq("handle", handle).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await findProfile((await params).handle);
  return p ? { title: `${p.display_name} (@${p.handle})`, description: p.bio ?? `${p.display_name} on Wanana.` } : { title: "Profile not found" };
}

export default async function PublicProfile({ params }: Props) {
  const p = await findProfile((await params).handle);
  if (!p) notFound();
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const own = viewerId === p.id;
  const path = `/u/${p.handle}`;
  const [counts, follow, following] = await Promise.all([countReviews(p.id), followState({ userId: p.id }, viewerId), followingCount(p.id)]);
  const place = [p.city, countryName(p.country_code)].filter(Boolean).join(", ");
  const joined = new Date(p.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <PageShell width="max-w-3xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar name={p.display_name} url={p.avatar_url} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{p.display_name}</h1>
          <p className="mt-1 text-mist">@{p.handle}</p>
          <p className="mt-2 text-sm text-mist">
            {place}
            {p.audience && (
              <>
                , <span className={p.audience === "home" ? "text-emerald-bright" : "text-gold"}>{p.audience}</span>
              </>
            )}
            . Joined {joined}.
          </p>
        </div>
      </div>
      {p.bio && <p className="mt-6 max-w-xl leading-relaxed">{p.bio}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-mist">
        {viewerId && !own && <ToggleButton what="follow_user" id={p.id} on={follow.following} back={path} label="Follow" onLabel="Following" />}
        <span>{plural(follow.followers, "follower")}</span>
        <span>{following.toLocaleString("en-GB")} following</span>
        <span>{plural(counts.ratings, "rating")}</span>
        <span>{plural(counts.reviews, "review")}</span>
        <ShareButton path={path} title={`${p.display_name} on Wanana`} />
        {viewerId && !own && <ReportButton targetType="profile" targetId={p.id} />}
      </div>
      <ProfileActivity authorId={p.id} viewerId={viewerId} path={path} own={own} />
    </PageShell>
  );
}
