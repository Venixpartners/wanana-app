import { SiteHeader } from "./site-header";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

/** "current" is kept for readability at call sites; the menu works out the active section from the address. */
export function PageShell({ width = "max-w-5xl", children }: { current?: string; width?: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <SiteNav />
      <main className={`mx-auto ${width} px-5 pb-16 pt-8 sm:px-6 sm:pt-10`}>{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageTitle({ title, intro, action }: { title: string; intro?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-mist">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
