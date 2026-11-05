import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { createClient, getViewer } from "@/lib/supabase/server";
import { Avatar } from "@/features/profile/components/avatar";
import { site } from "@/lib/site";

type Props = { params: Promise<{ handle: string }> };

async function inviter(raw: string) {
  const handle = raw.toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("handle, display_name, avatar_url").eq("handle", handle).maybeSingle();
  return data as { handle: string; display_name: string; avatar_url: string | null } | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await inviter((await params).handle);
  if (!p) return { title: "Invite not found" };
  const title = `${p.display_name} invited you to Wanana`;
  return { title, description: site.description, openGraph: { title, description: site.description, url: `/join/${p.handle}` } };
}

const POINTS = ["Score songs and albums out of 10", "See how fans at home and in the diaspora differ", "Vote in Versus battles and polls", "Argue it out in the community"];

/** Where an invite link lands. The share code on the link credits the friend who sent it. */
export default async function JoinPage({ params }: Props) {
  const p = await inviter((await params).handle);
  if (!p) notFound();
  const { userId } = await getViewer();
  return (
    <PageShell width="max-w-xl">
      <div className="flex flex-col items-center text-center">
        <Avatar name={p.display_name} url={p.avatar_url} size={80} />
        <p className="mt-4 text-mist">@{p.handle} invited you to</p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">{site.tagline}</h1>
        <p className="mt-4 max-w-md text-mist">{site.description}</p>
        <ul className="mt-6 grid gap-2 text-left text-sm">
          {POINTS.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
        {userId ? (
          <Link href="/explore" className="btn mt-8">
            You&apos;re already in. Go to Explore
          </Link>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href="/signup" className="btn">
              Join Wanana
            </Link>
            <Link href="/signin" className="text-sm text-mist underline underline-offset-4 hover:text-paper">
              I already have an account
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
