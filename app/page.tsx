import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitlistForm } from "@/features/waitlist/components/waitlist-form";
import { CountrySelect } from "@/components/country-select";
import { PulseCard } from "@/components/landing/pulse-card";
import { ChartPreview } from "@/components/landing/chart-preview";
import { AskPreview } from "@/components/landing/ask-preview";
import { site } from "@/lib/site";

const GENRES = ["Afrobeats", "Amapiano", "Afro fusion", "Alté", "Street pop", "Highlife", "Fuji", "Afro gospel", "Gqom", "Bongo flava", "Afro R&B"];

const AUDIENCES = [
  { name: "Fans", body: "Rate every release, argue it out in the threads and build a record of your taste that other fans can see." },
  { name: "Artists", body: "See how fans really feel about your music, at home and abroad, not just how many times it was played." },
  { name: "Industry", body: "Labels, managers, journalists, promoters and brands get the signal behind the streams, city by city." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-14 pt-6 sm:px-6 md:grid-cols-[1.2fr_1fr] md:gap-14 md:pb-20 md:pt-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-mist">
              <span className="size-1.5 rounded-full bg-orange" aria-hidden="true" />
              Coming soon
            </p>
            <h1 className="mt-6 font-display text-[2.15rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.4rem]">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{site.description}</p>
            <a href="#join" className="btn mt-8 w-full sm:w-auto">
              Join the waitlist
            </a>
          </div>
          <PulseCard />
        </section>

        {/* Genres */}
        <section aria-label="Genres on Wanana" className="border-y border-line">
          <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-4 [scrollbar-width:none] sm:px-6 md:flex-wrap md:justify-center">
            {GENRES.map((g) => (
              <li key={g} className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm text-paper/90">
                {g}
              </li>
            ))}
          </ul>
        </section>

        {/* Charts and Ask Wanana */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Charts ranked by the people who listen</h2>
            <p className="mt-4 text-lg leading-relaxed text-mist">
              Every rating counts toward a song's Fan Pulse. Wanana Charts rank what fans actually think, with separate charts for Nigeria, the
              diaspora and the songs rising fastest. Ask Wanana explains what's moving and why, using those same ratings.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <ChartPreview />
            <AskPreview />
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-3 md:py-20">
            {AUDIENCES.map((a) => (
              <div key={a.name}>
                <h3 className="font-display text-xl font-semibold">{a.name}</h3>
                <p className="mt-3 leading-relaxed text-mist">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Waitlist */}
        <section id="join" className="scroll-mt-6 border-t border-line bg-ink">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:py-24">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Get in first</h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-mist">
                Early members get their handle reserved and the first say on the charts. We'll email you the day Wanana opens.
              </p>
            </div>
            <div className="rounded-3xl border border-line bg-midnight p-5 sm:p-8">
              <WaitlistForm countrySelect={<CountrySelect name="country" id="country" />} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
