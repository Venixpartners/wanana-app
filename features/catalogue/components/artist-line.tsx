import Link from "next/link";
import type { ArtistRef } from "../queries";

/** "Artist feat. Guest One and Guest Two", each name linking to its page. */
export function ArtistLine({ main, featured = [], className = "" }: { main: ArtistRef; featured?: ArtistRef[]; className?: string }) {
  return (
    <span className={className}>
      <Link href={`/artist/${main.slug}`} className="hover:text-paper hover:underline">
        {main.name}
      </Link>
      {featured.length > 0 && (
        <>
          {" feat. "}
          {featured.map((f, i) => (
            <span key={f.id}>
              {i > 0 && (i === featured.length - 1 ? " and " : ", ")}
              <Link href={`/artist/${f.slug}`} className="hover:text-paper hover:underline">
                {f.name}
              </Link>
            </span>
          ))}
        </>
      )}
    </span>
  );
}
