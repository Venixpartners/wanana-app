export const site = {
  name: "Wanana",
  company: "Wanana Technologies Limited",
  tagline: "The AI Intelligence Layer for African Music Conversations",
  description:
    "Right now the conversation about African music is scattered across charts, streaming apps, blogs and social media. Wanana brings it into one place, with AI insights, reviews, polls, discussions and discovery side by side.",
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
