import Link from "next/link";
import { Ear } from "lucide-react";
import { earlyEars } from "../queries";

/** Early Ear badges: songs this fan scored highly before they reached the Fan Chart Top 10. Status only. */
export async function EarlyEarBadges({ userId, own }: { userId: string; own: boolean }) {
  const ears = await earlyEars(userId);
  if (!ears.length) {
    return own ? (
      <p className="mt-6 text-sm text-mist">
        Score a song 8 or more before it reaches the Fan Chart Top 10 and you&apos;ll earn an Early Ear badge for it.
      </p>
    ) : null;
  }
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Ear size={18} className="text-gold" aria-hidden="true" />
        Early Ear
      </h2>
      <p className="mt-1 text-sm text-mist">Backed these songs before they reached the Fan Chart Top 10.</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {ears.map((e) =>
          e.track ? (
            <li key={e.track_id}>
              <Link href={`/song/${e.track.slug}`} className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1.5 text-sm hover:border-gold">
                <span className="tabular-nums text-gold">{e.rating}</span>
                <span>
                  {e.track.title}
                  {e.track.artist && <span className="text-mist">, {e.track.artist}</span>}
                </span>
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
