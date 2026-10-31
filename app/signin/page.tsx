import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/supabase/server";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { GoogleButton } from "@/features/auth/components/google-button";
import { SignInForm } from "@/features/auth/components/signin-form";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  link: "That link has expired or was already used. Sign in below or ask for a new link.",
  google: "Google sign in didn't go through. Try again, or use your email instead.",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { userId, profile } = await getViewer();
  if (userId) redirect(profile ? "/me" : "/onboarding");
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Sign in to Wanana"
      intro={
        <>
          New here?{" "}
          <Link href="/signup" className="text-paper underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      {error && ERRORS[error] && (
        <p role="alert" className="mb-6 rounded-lg border border-orange/50 bg-orange/10 p-3 text-sm">
          {ERRORS[error]}
        </p>
      )}
      <GoogleButton />
      <SignInForm />
    </AuthShell>
  );
}
