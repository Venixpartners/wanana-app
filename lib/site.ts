export const site = {
  name: "Wanana",
  company: "Wanana Technologies Limited",
  tagline: "The Intelligence Layer for African Music",
  description:
    "Reviews, sentiment, discussions, polls and AI insights. One place to understand what's moving African music culture.",
  audience: "Built for fans, artists, managers, labels, journalists and promoters.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wanana.africa",
  socials: [
    { label: "Instagram", href: "https://instagram.com/wananaafrica" },
    { label: "TikTok", href: "https://tiktok.com/@wananaafrica" },
    { label: "X", href: "https://x.com/wananaafrica" },
    { label: "LinkedIn", href: "https://linkedin.com/company/wanana-africa" },
    { label: "Facebook", href: "https://facebook.com/wananaafrica" },
  ],
};

export type LaunchMode = "coming_soon" | "live";

export function launchMode(): LaunchMode {
  return process.env.NEXT_PUBLIC_LAUNCH_MODE === "live" ? "live" : "coming_soon";
}
