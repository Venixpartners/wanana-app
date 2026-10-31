import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { requireMember } from "@/lib/member";
import { subjectFromSlug } from "@/features/community/subjects";
import { PollForm } from "@/features/polls/components/poll-form";

export const metadata: Metadata = { title: "Ask a poll question", robots: { index: false } };

export default async function NewPoll({ searchParams }: { searchParams: Promise<{ artist?: string; release?: string; track?: string }> }) {
  await requireMember();
  const subject = await subjectFromSlug(await searchParams);
  return (
    <PageShell current="/polls" width="max-w-2xl">
      <PageTitle title="Ask a poll question" intro={subject ? `About ${subject.name}` : undefined} />
      <div className="mt-8">
        <PollForm subject={subject} />
      </div>
    </PageShell>
  );
}
