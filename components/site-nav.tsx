"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/community", label: "Community" },
  { href: "/polls", label: "Polls" },
  { href: "/rankings", label: "Rankings" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Main sections. Scrolls sideways on small phones rather than wrapping. */
export function SiteNav() {
  const pathname = usePathname() ?? "";
  const cls = (active: boolean) => `shrink-0 border-b-2 px-3 py-3 text-sm transition ${active ? "border-emerald-bright text-paper" : "border-transparent text-mist hover:text-paper"}`;
  return (
    <nav aria-label="Main" className="border-y border-line/70">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 sm:px-4">
        {LINKS.map((l) => {
          const active = isActive(pathname, l.href);
          return (
            <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={cls(active)}>
              {l.label}
            </Link>
          );
        })}
        <Link href="/search" aria-current={isActive(pathname, "/search") ? "page" : undefined} className={`ml-auto inline-flex items-center gap-1.5 ${cls(isActive(pathname, "/search"))}`}>
          <Search size={16} aria-hidden="true" />
          Search
        </Link>
      </div>
    </nav>
  );
}
