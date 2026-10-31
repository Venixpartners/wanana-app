import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/supabase/server";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { GoogleButton } from "@/features/auth/components/google-button";
import { SignUpForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage() {
  const { userId, profile } = await getViewer();
  if (userId) redirect(profile ? "/me" : "/onboarding");

  return (
    <AuthShell
      title="Create your Wanana account"
      intro={
        <>
          Already have one?{" "}
          <Link href="/signin" className="text-paper underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton />
      <SignUpForm />
      <p className="mt-6 text-sm text-mist">
        By creating an account you agree to how we handle your data in our{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-paper">
          privacy notice
        </Link>
        . You must be 18 or older.
      </p>
    </AuthShell>
  );
}
