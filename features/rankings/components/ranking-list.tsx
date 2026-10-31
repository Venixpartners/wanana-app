import Link from "next/link";
import { plural, timeAgo } from "@/lib/text";
import { Empty } from "@/features/community/components/empty";
import type { listRankings } from "../queries";

type Item = Awaited<ReturnType<typeof listRankings>>[number];

export function RankingList({ items, empty = "No lists yet." }: { items: Item[]; empty?: string }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((r) => (
        <li key={r.id}>
          <Link href={`/rankings/${r.id}`} className="block h-full rounded-2xl border border-line bg-ink p-5 transition hover:border-mist">
            <p className="font-display text-lg font-semibold">{r.title}</p>
            <p className="mt-1 text-sm text-mist">
              {r.author ? `@${r.author.handle}` : "A former member"}, {plural(r.item_count, "entry", "entries")}, updated {timeAgo(r.updated_at)}
              {!r.is_public && ", private"}
            </p>
            {r.preview.length > 0 && (
              <ol className="mt-3 grid gap-1 text-sm">
                {r.preview.map((s, i) => (
                  <li key={`${s.kind}:${s.id}`} className="truncate">
                    <span className="mr-2 font-semibold tabular-nums text-gold">{i + 1}</span>
                    {s.name}
                  </li>
                ))}
              </ol>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
