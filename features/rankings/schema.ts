import { z } from "zod";

export const rankingItemSchema = z.object({
  kind: z.enum(["artist", "release", "track"]),
  id: z.string().uuid(),
  name: z.string().max(200).optional(),
  detail: z.string().max(200).nullable().optional(),
  note: z
    .string()
    .trim()
    .max(280, "Keep each note to 280 characters.")
    .optional()
    .transform((n) => n || undefined),
});
export type RankingItemInput = z.infer<typeof rankingItemSchema>;

export const rankingSchema = z.object({
  title: z.string().trim().min(3, "Give your list a title of at least 3 characters.").max(120, "Keep the title to 120 characters."),
  description: z
    .string()
    .trim()
    .max(600, "Keep the description to 600 characters.")
    .transform((d) => d || null),
  is_public: z.boolean(),
  items: z
    .array(rankingItemSchema)
    .min(1, "Add at least one entry.")
    .max(50, "Fifty entries at most.")
    .refine((items) => new Set(items.map((i) => `${i.kind}:${i.id}`)).size === items.length, "Each entry can appear once."),
});

export function parseItems(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
