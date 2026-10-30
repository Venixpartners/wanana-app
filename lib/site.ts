export const site = {
  name: "Wanana",
  company: "Wanana Technologies Limited",
  tagline: "Africa's music, measured by the people who love it.",
  description:
    "Wanana brings charts, releases and credits together with what fans actually think. Rate songs, settle debates and see how a record lands in Lagos compared with London.",
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
