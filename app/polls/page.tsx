import Link from "next/link";
import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { listPolls } from "@/features/polls/queries";
import { PollCard } from "@/features/polls/components/poll-card";
import { Empty } from "@/features/community/components/empty";

export const metadata: Metadata = { title: "Polls", description: "Vote on the questions African music fans are arguing about." };

export default async function PollsPage() {
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const polls = await listPolls({ limit: 30, viewerId });
  return (
    <PageShell current="/polls">
      <PageTitle
        title="Polls"
        intro="Settle it with a vote. Polls are for opinions only, with no prizes or stakes."
        action={
          <Link href="/polls/new" className="btn">
            Ask a question
          </Link>
        }
      />
      <div className="mt-8">
        {polls.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {polls.map((p) => (
              <PollCard key={p.id} poll={p} viewerId={viewerId} back="/polls" />
            ))}
          </div>
        ) : (
          <Empty>No polls yet. Ask the first question.</Empty>
        )}
      </div>
    </PageShell>
  );
}
