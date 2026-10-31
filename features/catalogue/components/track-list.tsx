import Link from "next/link";
import type { ArtistRef, Track } from "../queries";
import { formatDuration } from "../format";
import { ArtistLine } from "./artist-line";

export function TrackList({
  tracks,
  artists,
  features,
  numbered = false,
}: {
  tracks: Track[];
  artists: Map<string, ArtistRef>;
  features: Map<string, ArtistRef[]>;
  numbered?: boolean;
}) {
  if (!tracks.length) return <p className="text-mist">No songs listed yet.</p>;
  return (
    <ol className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
      {tracks.map((t, i) => {
        const main = artists.get(t.artist_id);
        return (
          <li key={t.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
            {numbered && <span className="w-6 text-center tabular-nums text-mist">{t.track_number ?? i + 1}</span>}
            <div className="min-w-0 flex-1">
              <Link href={`/song/${t.slug}`} className="block truncate font-medium hover:underline">
                {t.title}
              </Link>
              {main && <ArtistLine main={main} featured={features.get(t.id)} className="block truncate text-sm text-mist" />}
            </div>
            <span className="text-sm tabular-nums text-mist">{formatDuration(t.duration_seconds)}</span>
          </li>
        );
      })}
    </ol>
  );
}
