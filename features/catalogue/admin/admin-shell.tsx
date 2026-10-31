import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function AdminShell({ title, back, children }: { title: string; back?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 pb-16 pt-4 sm:px-6">
        <p className="text-sm text-gold">Admin</p>
        {back && (
          <Link href={back.href} className="mt-2 inline-block text-sm text-mist hover:text-paper">
            {back.label}
          </Link>
        )}
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
