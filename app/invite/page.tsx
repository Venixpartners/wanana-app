import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PageShell, PageTitle } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { myInvites } from "@/features/badges/queries";
import { ShareButton } from "@/features/community/components/share-button";
import { plural } from "@/lib/text";

export const metadata: Metadata = { title: "Invite friends", robots: { index: false } };

function dateText(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function InvitePage() {
  const { userId, profile } = await getViewer();
  if (!userId) redirect("/signin");
  if (!profile) redirect("/onboarding");
  const inv = await myInvites();
  const joined = inv?.friends_joined ?? 0;
  const needed = inv?.needed ?? 3;
  const open = inv ? new Date(`${inv.founding_until}T23:59:59+01:00`).getTime() > Date.now() : false;

  return (
    <PageShell width="max-w-2xl">
      <PageTitle title="Invite friends" intro="Wanana gets better with every fan who rates and argues. Send your link to the people you talk music with." />

      <div className="mt-8 rounded-2xl border border-line bg-ink p-5">
        <p className="text-sm text-mist">Your invite link</p>
        <p className="mt-1 break-all font-mono text-sm">wanana.africa/join/{profile.handle}</p>
        <div className="mt-4">
          <ShareButton path={`/join/${profile.handle}`} title={`Join me on Wanana, where fans rate and talk about African music`} />
        </div>
        <p className="mt-4 text-xs text-mist">Use the share button so the link carries your code. A friend counts once they join through it and finish their profile. Any Wanana link you share this way counts too.</p>
      </div>

      <div className={`mt-6 rounded-2xl border p-5 ${inv?.has_badge ? "border-gold/60" : "border-line"} bg-ink`}>
        <p className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles size={18} className="text-gold" aria-hidden="true" />
          Founding Fan
        </p>
        {inv?.has_badge ? (
          <p className="mt-2 text-sm">You&apos;re a Founding Fan. The badge shows on your profile and next to everything you post.</p>
        ) : open ? (
          <>
            <p className="mt-2 text-sm">
              Bring {needed} friends to Wanana before {inv ? dateText(inv.founding_until) : "the founding period ends"} and the Founding Fan badge is yours for good.
            </p>
            <div className="mt-4 flex gap-2" aria-label={`${joined} of ${needed} friends joined`}>
              {Array.from({ length: needed }, (_, i) => (
                <span key={i} className={`h-2 flex-1 rounded-full ${i < joined ? "bg-gold" : "bg-line"}`} />
              ))}
            </div>
            <p className="mt-2 text-xs text-mist">{plural(Math.min(joined, needed), "friend")} joined so far.</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-mist">The founding period has ended. Thanks for bringing {plural(joined, "friend")} along.</p>
        )}
        <p className="mt-4 text-xs text-mist">Badges are status only. There are no prizes or rewards of any kind.</p>
      </div>

      <p className="mt-6 text-sm">
        <Link href={`/u/${profile.handle}`} className="text-mist underline underline-offset-4 hover:text-paper">
          See your public profile
        </Link>
      </p>
    </PageShell>
  );
}
