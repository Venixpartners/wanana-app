import Link from "next/link";
import { Avatar } from "@/features/profile/components/avatar";
import { timeAgo } from "@/lib/text";
import type { Person } from "../people";

export function PersonLine({ person, at, size = 28 }: { person?: Person; at?: string; size?: number }) {
  if (!person) return <span className="text-sm text-mist">A former member{at ? `, ${timeAgo(at)}` : ""}</span>;
  return (
    <span className="flex min-w-0 items-center gap-2 text-sm">
      <Avatar name={person.display_name} url={person.avatar_url} size={size} />
      <Link href={`/u/${person.handle}`} className="truncate font-medium hover:underline">
        {person.display_name}
      </Link>
      <span className="truncate text-mist">
        @{person.handle}
        {at ? `, ${timeAgo(at)}` : ""}
      </span>
    </span>
  );
}
