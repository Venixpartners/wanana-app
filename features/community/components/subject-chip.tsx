import Link from "next/link";
import { KIND_WORD, subjectHref, type Subject } from "../subjects";

export function SubjectChip({ subject, genre }: { subject?: Subject | null; genre?: string | null }) {
  if (subject) {
    return (
      <Link href={subjectHref(subject)} className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-line px-2.5 py-0.5 text-xs text-mist hover:text-paper">
        <span className="capitalize">{KIND_WORD[subject.kind]}</span>: {subject.name}
      </Link>
    );
  }
  if (genre) {
    return (
      <Link href={`/explore/genre/${encodeURIComponent(genre.toLowerCase())}`} className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-xs text-mist hover:text-paper">
        {genre}
      </Link>
    );
  }
  return null;
}
