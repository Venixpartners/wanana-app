import type { Metadata } from "next";
import { lastVerdictFriday } from "@/features/verdict/queries";
import { VerdictPage } from "@/features/verdict/components/verdict-page";

export const metadata: Metadata = {
  title: "Fan Verdict",
  description: "Every week's new releases, ranked by what fans at home and in the diaspora scored them.",
  openGraph: { title: "The Fan Verdict on Wanana", description: "Every week's new releases, ranked by what fans scored them.", url: "/verdict" },
};

export default async function LatestVerdict() {
  return <VerdictPage friday={await lastVerdictFriday()} showLive />;
}
