import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitlistForm } from "@/components/waitlist-form";
import { CountrySelect } from "@/components/country-select";
import { SignalLine } from "@/components/signal-line";
import { site } from "@/lib/site";

const features = [
  {
    name: "Fan Pulse",
    body: "Every song, album and artist gets a score built from real fan ratings and reviews, split between home and the diaspora.",
  },
  {
    name: "Wanana Charts",
    body: "Charts ranked by what fans think, not just what gets played. Nigeria, Diaspora, Rising and the overall Fan Chart.",
  },
  {
    name: "Ask Wanana",
    body: "Ask anything about African music and get answers grounded in our data, with the sources shown every time.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-10 md:grid-cols-[1.15fr_1fr] md:gap-16 md:pt-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">Coming soon</p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-[3.5rem]">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{site.description}</p>
            <p className="mt-6 text-sm text-mist">Opening in Nigeria and across the diaspora at the same time.</p>
          </div>
          <div className="rounded-2xl border border-line bg-ink p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold">Get in first</h2>
            <p className="mb-6 mt-1 text-sm text-mist">Early members get their handle reserved and the first say on the charts.</p>
            <WaitlistForm countrySelect={<CountrySelect name="country" id="country" />} />
          </div>
        </section>

        <SignalLine className="mx-auto max-w-6xl text-emerald" />

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.name}>
              <h3 className="font-display text-lg font-semibold">{f.name}</h3>
              <p className="mt-2 leading-relaxed text-mist">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
