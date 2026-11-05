import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isKitKind, scoreFor } from "@/features/share/badge-data";
import { site } from "@/lib/site";
import { plural } from "@/lib/text";

export const metadata: Metadata = { title: "Fan Pulse", robots: { index: false, follow: false } };

type Props = { params: Promise<{ kind: string; slug: string }> };

function Bar({ label, value, tone }: { label: string; value: number | null; tone: string }) {
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs text-mist">
        <span>{label}</span>
        <span className="text-paper tabular-nums">{value ?? "No scores"}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        {value !== null && <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />}
      </div>
    </div>
  );
}

/** The score box blogs embed with an iframe. Links open Wanana in a new tab. */
export default async function Embed({ params }: Props) {
  const { kind, slug } = await params;
  if (!isKitKind(kind)) notFound();
  const s = await scoreFor(kind, slug);
  if (!s) notFound();
  const url = new URL(s.href, site.url).toString();
  return (
    <main className="flex min-h-dvh items-center p-2">
      <div className="w-full rounded-2xl border border-line bg-ink p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 text-center">
            <p className="font-display text-4xl font-semibold tabular-nums leading-none">{s.pulse ?? "New"}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-gold">Fan Pulse</p>
          </div>
          <div className="min-w-0 flex-1">
            <a href={url} target="_blank" rel="noopener" className="block truncate font-display font-semibold hover:underline">
              {s.name}
            </a>
            {s.sub && <p className="truncate text-sm text-mist">{s.sub}</p>}
            <p className="mt-1 text-xs text-mist">{s.average !== null ? `${s.average.toFixed(1)} out of 10 from ${plural(s.ratings, "fan score")}` : "No fan scores yet"}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-4">
          <Bar label="Home" value={s.home} tone="bg-emerald-bright" />
          <Bar label="Diaspora" value={s.diaspora} tone="bg-orange" />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-display font-semibold">wanana</span>
          <a href={url} target="_blank" rel="noopener" className="text-emerald-bright hover:underline">
            Add your score on Wanana
          </a>
        </div>
      </div>
    </main>
  );
}
