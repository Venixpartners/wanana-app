import { z } from "zod";

export const discussionSchema = z.object({
  title: z.string().trim().min(3, "Give it a title of at least 3 characters.").max(140, "Keep the title to 140 characters."),
  body: z.string().trim().min(1, "Say something to start the conversation.").max(5000, "Keep it to 5,000 characters."),
  genre: z
    .string()
    .trim()
    .max(40, "Keep the genre to 40 characters.")
    .transform((g) => g || null),
});

export const replySchema = z.object({
  body: z.string().trim().min(1, "Write a reply first.").max(3000, "Keep replies to 3,000 characters."),
});
