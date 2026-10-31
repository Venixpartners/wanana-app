import { z } from "zod";

export const reviewSchema = z
  .object({
    rating: z.coerce.number({ message: "Choose a score from 1 to 10." }).int().min(1, "Choose a score from 1 to 10.").max(10, "Choose a score from 1 to 10."),
    title: z
      .string()
      .trim()
      .max(120, "Keep the headline to 120 characters.")
      .transform((v) => v || null),
    body: z
      .string()
      .trim()
      .max(5000, "Keep your review to 5,000 characters.")
      .transform((v) => v || null),
  })
  .refine((r) => !r.title || r.body, { path: ["body"], message: "Add your review, or clear the headline to just rate." });

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Write a comment first.").max(2000, "Keep comments to 2,000 characters."),
});

/** Average to one decimal place, or null with no ratings. */
export function average(ratings: number[]): number | null {
  if (!ratings.length) return null;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}
