export type BadgeKey = "founding_fan" | "voice";

export const BADGE_INFO: Record<BadgeKey, { label: string; about: string }> = {
  founding_fan: { label: "Founding Fan", about: "Brought three friends to Wanana in its founding months." },
  voice: { label: "Wanana Voice", about: "One of Wanana's most helpful reviewers, featured across the site." },
};
