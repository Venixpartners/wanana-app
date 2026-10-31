import Link from "next/link";
import { CoverArt } from "@/components/landing/cover-art";
import { artVariant } from "@/features/catalogue/slug";
import { Empty } from "@/features/community/components/empty";

export function ArtistGrid({ artists, empty = "No artists yet." }: { artists: { id: string; slug: string; name: string; genres?: string[] }[]; empty?: string }) {
  if (!artists.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
      {artists.map((a) => (
        <li key={a.id}>
          <Link href={`/artist/${a.slug}`} className="group block text-center">
            <CoverArt variant={artVariant(a.slug)} className="mx-auto aspect-square w-full rounded-full transition group-hover:opacity-90" />
            <p className="mt-2 truncate text-sm font-medium group-hover:underline">{a.name}</p>
            {a.genres?.[0] && <p className="truncate text-xs text-mist">{a.genres[0]}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
