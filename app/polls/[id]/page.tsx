import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/text";
import { getPoll } from "@/features/polls/queries";
import { deletePollAction } from "@/features/polls/actions";
import { PollCard } from "@/features/polls/components/poll-card";
import { ShareButton } from "@/features/community/components/share-button";
import { ReportButton } from "@/features/community/components/report-button";
import { DeleteButton } from "@/features/community/components/delete-button";
import { JoinPrompt } from "@/features/community/components/join-prompt";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const poll = isUuid(id) ? await getPoll(id, null) : null;
  return poll ? { title: poll.question, description: `Vote on Wanana: ${poll.question}` } : { title: "Poll not found" };
}

export default async function PollPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { userId, profile } = await getViewer();
  const viewerId = profile ? userId : null;
  const poll = await getPoll(id, viewerId);
  if (!poll) notFound();
  const path = `/polls/${poll.id}`;
  return (
    <PageShell current="/polls" width="max-w-2xl">
      <Link href="/polls" className="text-sm text-mist hover:text-paper">
        Back to Polls
      </Link>
      <div className="mt-4">
        <PollCard poll={poll} viewerId={viewerId} back={path} linkTitle={false} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ShareButton path={path} title={poll.question} />
        {viewerId === poll.author_id && <DeleteButton action={deletePollAction} id={poll.id} label="Delete poll" />}
        {viewerId && viewerId !== poll.author_id && <ReportButton targetType="poll" targetId={poll.id} />}
      </div>
      {!viewerId && (
        <div className="mt-8">
          <JoinPrompt signedIn={!!userId} what="vote" />
        </div>
      )}
    </PageShell>
  );
}
