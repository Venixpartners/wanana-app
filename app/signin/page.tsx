import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/lib/supabase/server";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { userId, profile } = await getViewer();
  if (userId) redirect(profile ? "/me" : "/onboarding");
  const { error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in to Wanana</h1>
        <p className="mb-8 mt-2 text-mist">Rate songs, write reviews and get your say on the charts.</p>
        {error && (
          <p role="alert" className="mb-6 rounded-lg border border-orange/50 bg-orange/10 p-3 text-sm">
            That link has expired or was already used. Request a new one below.
          </p>
        )}
        <SignInForm />
      </main>
      <SiteFooter />
    </>
  );
}
