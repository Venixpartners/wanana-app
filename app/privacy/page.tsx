import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 leading-relaxed">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-2 text-sm text-mist">Waitlist notice. A full privacy policy will be published before launch.</p>
        <div className="mt-8 space-y-5 text-mist">
          <p>
            {site.company} runs Wanana. When you join the waitlist we keep your email address, the country you choose and whether you are a fan,
            an artist or from the industry.
          </p>
          <p>We use this only to tell you when Wanana opens and to plan the launch in each country. We do not sell it or share it with advertisers.</p>
          <p>
            Your data is stored with our database provider in the United Kingdom. We handle it in line with the Nigeria Data Protection Act 2023 and,
            for members abroad, the data protection laws where you live.
          </p>
          <p>You can ask us to delete your waitlist entry at any time by messaging us on any of our social accounts listed below.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
