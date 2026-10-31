import Link from "next/link";
import { CoverArt } from "@/components/landing/cover-art";
import type { Release } from "../queries";
import { KIND_LABEL, releaseYear } from "../format";
import { artVariant } from "../slug";

export function ReleaseGrid({ releases }: { releases: Release[] }) {
  if (!releases.length) return <p className="text-mist">No releases listed yet.</p>;
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      {releases.map((r) => (
        <li key={r.id}>
          <Link href={`/album/${r.slug}`} className="group block">
            <CoverArt variant={artVariant(r.slug)} className="aspect-square w-full rounded-xl transition group-hover:opacity-90" />
            <p className="mt-2 truncate font-medium group-hover:underline">{r.title}</p>
            <p className="text-sm text-mist">
              {[KIND_LABEL[r.kind], releaseYear(r.release_date)].filter(Boolean).join(", ")}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
