import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ear } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { CoverArt } from "@/components/landing/cover-art";
import { getViewer } from "@/lib/supabase/server";
import { Avatar } from "@/features/profile/components/avatar";
import { Section } from "@/features/catalogue/components/section";
import { Empty } from "@/features/community/components/empty";
import { ShareButton } from "@/features/community/components/share-button";
import { agreementWord, parsePeriod, recentPeriods } from "@/features/wrapped/periods";
import { getWrapped } from "@/features/wrapped/queries";
import { plural } from "@/lib/text";

type Props = { params: Promise<{ handle: string; period: string }> };

async function load(params: Props["params"]) {
  const { handle, period: key } = await params;
  const period = parsePeriod(key);
  if (!period) return null;
  const w = await getWrapped(handle.toLowerCase(), period);
  return w ? { period, w } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const got = await load(params);
  if (!got) return { title: "Wrapped not found" };
  const title = `${got.w.person.display_name}'s Wanana Wrapped, ${got.period.label}`;
  const description = `${plural(got.w.scores, "score")} given. See their top picks and how their taste compares with fans at home and abroad.`;
  return { title, description, openGraph: { title, description, url: `/wrapped/${got.w.person.handle}/${got.period.key}` } };
}

function Agree({ label, pct, tone }: { label: string; pct: number | null; tone: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink p-5">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{pct === null ? "None" : `${pct}%`}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        {pct !== null && <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />}
      </div>
      <p className="mt-2 text-sm">{agreementWord(pct)}</p>
    </div>
  );
}

export default async function WrappedPage({ params }: Props) {
  const got = await load(params);
  if (!got) notFound();
  const { period, w } = got;
  const { userId } = await getViewer();
  const own = userId === w.person.id;
  const path = `/wrapped/${w.person.handle}/${period.key}`;
  const who = own ? "You" : w.person.display_name;

  return (
    <PageShell width="max-w-3xl">
      <div className="flex items-center gap-4">
        <Avatar name={w.person.display_name} url={w.person.avatar_url} size={56} />
        <div className="min-w-0">
          <p className="text-sm text-gold">Wanana Wrapped</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{period.label}</h1>
          <Link href={`/u/${w.person.handle}`} className="text-sm text-mist hover:text-paper">
            @{w.person.handle}
          </Link>
        </div>
        <div className="ml-auto">
          <ShareButton path={path} title={`${own ? "My" : `${w.person.display_name}'s`} Wanana Wrapped, ${period.label}`} />
        </div>
      </div>

      <nav aria-label="Periods" className="mt-6 flex gap-2 overflow-x-auto">
        {recentPeriods().map((k) => {
          const p = parsePeriod(k);
          if (!p) return null;
          return (
            <Link
              key={k}
              href={`/wrapped/${w.person.handle}/${k}`}
              aria-current={k === period.key ? "page" : undefined}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${k === period.key ? "border-emerald bg-emerald/20 text-paper" : "border-line text-mist hover:border-mist hover:text-paper"}`}
            >
              {p.kind === "year" ? `All of ${p.label}` : p.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>

      {w.scores === 0 ? (
        <div className="mt-8">
          <Empty>
            No scores in {period.label} yet.{" "}
            {own && (
              <Link href="/explore" className="text-paper underline">
                Find something to score
              </Link>
            )}
          </Empty>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["Scores", w.scores.toLocaleString("en-GB")],
              ["Written reviews", w.written.toLocaleString("en-GB")],
              ["Average given", w.average?.toFixed(1) ?? "None"],
            ].map(([label, v]) => (
              <div key={label} className="rounded-2xl border border-line bg-ink p-4">
                <p className="font-display text-3xl font-semibold tabular-nums">{v}</p>
                <p className="mt-1 text-sm text-mist">{label}</p>
              </div>
            ))}
          </div>

          <Section title={`${who === "You" ? "Your" : `${who}'s`} top picks`}>
            <ol className="grid gap-2">
              {w.top.map((t, i) => (
                <li key={`${t.href}-${i}`} className="flex items-center gap-3 rounded-2xl border border-line bg-ink p-3">
                  <span className="w-5 text-center font-display font-semibold tabular-nums text-mist">{i + 1}</span>
                  <CoverArt variant={t.art} className="size-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <Link href={t.href} className="block truncate font-medium hover:underline">
                      {t.title}
                    </Link>
                    {t.by && <p className="truncate text-sm text-mist">{t.by}</p>}
                  </div>
                  <span className="font-display text-xl font-semibold tabular-nums">{t.rating}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Taste check">
            <div className="grid gap-3 sm:grid-cols-2">
              <Agree label="Agreement with fans at home" pct={w.agree_home} tone="bg-emerald-bright" />
              <Agree label="Agreement with the diaspora" pct={w.agree_diaspora} tone="bg-orange" />
            </div>
            <p className="mt-3 text-xs text-mist">How close {own ? "your" : "their"} scores sit to the average score other fans gave the same songs and releases.</p>
          </Section>

          {(w.artists.length > 0 || w.genres.length > 0) && (
            <Section title="Who and what got the most scores">
              <div className="flex flex-wrap gap-2">
                {w.artists.map((a) => (
                  <Link key={a.slug} href={`/artist/${a.slug}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-mist">
                    {a.name} <span className="text-mist">({a.n})</span>
                  </Link>
                ))}
                {w.genres.map((g) => (
                  <span key={g} className="rounded-full border border-gold/40 px-3 py-1.5 text-sm text-gold">
                    {g}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {w.early_ears > 0 && (
            <p className="mt-10 flex items-center gap-2 rounded-2xl border border-gold/50 bg-ink p-4 text-sm">
              <Ear size={18} className="text-gold" aria-hidden="true" />
              {plural(w.early_ears, "Early Ear badge")} earned in {period.label}.
            </p>
          )}
        </>
      )}
    </PageShell>
  );
}
