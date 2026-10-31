import type { Metadata } from "next";
import { PageShell, PageTitle } from "@/components/page-shell";
import { requireMember } from "@/lib/member";
import { subjectFromSlug } from "@/features/community/subjects";
import { DiscussionForm } from "@/features/discussions/components/discussion-form";

export const metadata: Metadata = { title: "Start a discussion", robots: { index: false } };

export default async function NewDiscussion({ searchParams }: { searchParams: Promise<{ artist?: string; release?: string; track?: string }> }) {
  await requireMember();
  const subject = await subjectFromSlug(await searchParams);
  return (
    <PageShell current="/community" width="max-w-2xl">
      <PageTitle title="Start a discussion" intro={subject ? `About ${subject.name}` : undefined} />
      <div className="mt-8">
        <DiscussionForm subject={subject} />
      </div>
    </PageShell>
  );
}
