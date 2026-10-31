import Link from "next/link";

/** Shown in place of a form to people who are signed out or haven't finished their profile. */
export function JoinPrompt({ signedIn, what }: { signedIn: boolean; what: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-5 text-sm">
      <p className="text-mist">
        {signedIn ? `Finish your profile to ${what}.` : `Sign in to ${what}. It's free.`}
      </p>
      <Link href={signedIn ? "/onboarding" : "/signin"} className="btn-quiet mt-3">
        {signedIn ? "Finish your profile" : "Sign in"}
      </Link>
    </div>
  );
}
