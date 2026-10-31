import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function AuthShell({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader showAction={false} />
      <main className="mx-auto max-w-md px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {intro && <div className="mb-8 mt-2 text-mist">{intro}</div>}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
