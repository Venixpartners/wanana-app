import Link from "next/link";
import { Logo } from "./logo";
import { launchMode } from "@/lib/site";
import { getViewer } from "@/lib/supabase/server";

export async function SiteHeader({ showAction = true }: { showAction?: boolean } = {}) {
  const live = launchMode() === "live";
  const viewer = showAction ? await getViewer() : null;
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
      <Logo />
      {!showAction ? null : viewer?.userId ? (
        <div className="flex items-center gap-2">
          {viewer.profile?.role === "admin" && (
            <Link href="/admin/catalogue" className="btn-quiet">
              Admin
            </Link>
          )}
          <Link href={viewer.profile ? "/me" : "/onboarding"} className="btn-quiet">
            {viewer.profile ? `@${viewer.profile.handle}` : "Finish your profile"}
          </Link>
        </div>
      ) : !live ? (
        <a href="#join" className="btn-quiet hidden sm:inline-flex">
          Join the waitlist
        </a>
      ) : (
        <Link href="/signin" className="btn-quiet">
          Sign in
        </Link>
      )}
    </header>
  );
}
