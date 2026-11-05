import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFriday, verdictDateText } from "@/features/verdict/queries";
import { VerdictPage } from "@/features/verdict/components/verdict-page";

type Props = { params: Promise<{ friday: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { friday } = await params;
  if (!isFriday(friday)) return { title: "Verdict not found" };
  const title = `Fan Verdict, week of ${verdictDateText(friday)}`;
  const description = "The week's new releases, ranked by what fans scored them on Wanana.";
  return { title, description, openGraph: { title, description, url: `/verdict/${friday}` } };
}

export default async function WeekVerdict({ params }: Props) {
  const { friday } = await params;
  if (!isFriday(friday)) notFound();
  return <VerdictPage friday={friday} showLive={false} />;
}
