import { z } from "zod";

export const DURATIONS = [
  ["", "Stays open"],
  ["1", "1 day"],
  ["3", "3 days"],
  ["7", "1 week"],
  ["30", "30 days"],
] as const;

export const pollSchema = z.object({
  question: z.string().trim().min(5, "Ask a question of at least 5 characters.").max(200, "Keep the question to 200 characters."),
  options: z
    .array(z.string().trim().max(80, "Keep each choice to 80 characters."))
    .transform((o) => o.filter(Boolean))
    .refine((o) => o.length >= 2, "Give at least two choices.")
    .refine((o) => o.length <= 6, "Six choices at most.")
    .refine((o) => new Set(o.map((x) => x.toLowerCase())).size === o.length, "Each choice needs to be different."),
  days: z.enum(["", "1", "3", "7", "30"]).default(""),
  genre: z
    .string()
    .trim()
    .max(40, "Keep the genre to 40 characters.")
    .transform((g) => g || null),
});

export function closesAt(days: string, now = Date.now()): string | null {
  return days ? new Date(now + Number(days) * 86_400_000).toISOString() : null;
}

/** Whole number percentages that add up to 100. */
export function percentages(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  const raw = counts.map((c) => (c / total) * 100);
  const floored = raw.map(Math.floor);
  let left = 100 - floored.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floored[i] += 1;
    left -= 1;
  }
  return floored;
}
