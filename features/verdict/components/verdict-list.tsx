import Link from "next/link";
import { CoverArt } from "@/components/landing/cover-art";
import { KIND_LABEL } from "@/features/catalogue/format";
import { plural } from "@/lib/text";
import type { VerdictEntry } from "../queries";

/** The week's releases ranked by fan scores, with the home and diaspora reading for each. */
export function VerdictList({ entries }: { entries: VerdictEntry[] }) {
  return (
    <ol className="grid gap-3">
      {entries.map((e) => (
        <li key={e.release_id} className={`flex items-center gap-3 rounded-2xl border bg-ink p-3 sm:gap-4 sm:p-4 ${e.position === 1 ? "border-gold/60" : "border-line"}`}>
          <span className="w-7 shrink-0 text-center font-display text-xl font-semibold tabular-nums">{e.position}</span>
          <CoverArt variant={e.release?.art ?? 0} className="size-14 shrink-0 rounded-lg sm:size-16" />
          <div className="min-w-0 flex-1">
            {e.release ? (
              <Link href={`/album/${e.release.slug}`} className="block truncate font-medium hover:underline">
                {e.release.title}
              </Link>
            ) : (
              <span className="text-mist">Removed</span>
            )}
            <p className="truncate text-sm text-mist">
              {[e.release?.artist, e.release ? KIND_LABEL[e.release.kind] : null].filter(Boolean).join(", ")}
            </p>
            <p className="mt-1 text-xs text-mist">
              Home {e.home_pulse ?? "no scores"} · Diaspora {e.diaspora_pulse ?? "no scores"} · {plural(e.ratings, "score")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-2xl font-semibold tabular-nums">{e.pulse}</p>
            <p className="text-xs text-mist">Fan Pulse</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
