import Link from "next/link";
import type { Genre } from "../queries";

export function GenreChips({ genres }: { genres: Genre[] }) {
  if (!genres.length) return <p className="text-sm text-mist">Genres appear here as artists are added.</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {genres.map((g) => (
        <li key={g.slug}>
          <Link href={`/explore/genre/${encodeURIComponent(g.slug)}`} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition hover:border-mist">
            {g.name}
            <span className="text-xs tabular-nums text-mist">{g.artists}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
