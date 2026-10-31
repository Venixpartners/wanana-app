import Link from "next/link";
import { MessageSquare, Heart } from "lucide-react";
import { timeAgo } from "@/lib/text";
import { SubjectChip } from "@/features/community/components/subject-chip";
import { Empty } from "@/features/community/components/empty";
import type { DiscussionItem } from "../queries";

export function DiscussionList({ items, empty = "No discussions yet. Start the first one.", showSubject = true }: { items: DiscussionItem[]; empty?: string; showSubject?: boolean }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
      {items.map((d) => (
        <li key={d.id} className="px-4 py-4 sm:px-5">
          <Link href={`/community/${d.id}`} className="block font-medium hover:underline">
            {d.title}
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-mist">
            {showSubject && <SubjectChip subject={d.subject} genre={d.genre} />}
            <span>{d.author ? `@${d.author.handle}` : "A former member"}</span>
            <span>{timeAgo(d.last_activity_at)}</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={14} aria-hidden="true" />
              <span className="sr-only">Replies</span>
              {d.reply_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={14} aria-hidden="true" />
              <span className="sr-only">Likes</span>
              {d.like_count}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
