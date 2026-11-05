import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { CoverArt } from "@/components/landing/cover-art";
import { artVariant } from "@/features/catalogue/slug";
import { plural } from "@/lib/text";
import { movement, movementText } from "../charts";
import type { ChartEntry } from "../queries";

function Move({ position, last }: { position: number; last: number | null }) {
  const m = movement(position, last);
  const label = movementText(m);
  if (m.kind === "new") return <span className="text-[11px] font-semibold uppercase tracking-wide text-gold">New</span>;
  const Icon = m.kind === "up" ? ArrowUp : m.kind === "down" ? ArrowDown : Minus;
  const tone = m.kind === "up" ? "text-emerald-bright" : m.kind === "down" ? "text-orange" : "text-mist";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${tone}`} title={label}>
      <Icon size={13} aria-hidden="true" />
      {m.by > 0 && m.by}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** A chart as a ranked list. "compact" drops the score column for use inside other pages. */
export function ChartTable({ entries, compact = false }: { entries: ChartEntry[]; compact?: boolean }) {
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-ink">
      {entries.map((e) => (
        <li key={e.track_id} className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <span className="font-display text-lg font-semibold tabular-nums">{e.position}</span>
            <Move position={e.position} last={e.last_position} />
          </div>
          <CoverArt variant={artVariant(e.releaseSlug ?? e.track.slug)} className="size-12 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <Link href={`/song/${e.track.slug}`} className="block truncate font-medium hover:underline">
              {e.track.title}
            </Link>
            {e.artist && (
              <Link href={`/artist/${e.artist.slug}`} className="block truncate text-sm text-mist hover:text-paper">
                {e.artist.name}
              </Link>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-lg font-semibold tabular-nums">{e.pulse}</p>
            <p className="text-xs text-mist">{compact ? "Pulse" : plural(e.ratings, "score")}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
