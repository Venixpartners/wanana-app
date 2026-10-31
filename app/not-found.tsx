import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">We couldn't find that page</h1>
        <p className="mt-3 text-mist">The link may be wrong, or the page may have moved.</p>
        <Link href="/" className="btn mt-8">
          Go to the home page
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
