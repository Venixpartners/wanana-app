import Link from "next/link";
import { Logo } from "./logo";
import { launchMode } from "@/lib/site";
import { getViewer } from "@/lib/supabase/server";

export async function SiteHeader({ showAction = true }: { showAction?: boolean } = {}) {
  const live = launchMode() === "live";
  const viewer = live ? await getViewer() : null;
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
      <Logo />
      {!showAction ? null : !live ? (
        <a href="#join" className="btn-quiet hidden sm:inline-flex">
          Join the waitlist
        </a>
      ) : viewer?.userId ? (
        <Link href={viewer.profile ? "/me" : "/onboarding"} className="btn-quiet">
          {viewer.profile ? `@${viewer.profile.handle}` : "Finish your profile"}
        </Link>
      ) : (
        <Link href="/signin" className="btn-quiet">
          Sign in
        </Link>
      )}
    </header>
  );
}
