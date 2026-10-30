import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-mist md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.company}
        </p>
        <nav aria-label="Social" className="flex flex-wrap gap-x-5 gap-y-2">
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
              {s.label}
            </a>
          ))}
        </nav>
        <nav aria-label="Policies" className="flex gap-5">
          <Link href="/privacy" className="hover:text-paper">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
