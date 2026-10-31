import { z } from "zod";
import { emailSchema } from "@/features/auth/schema";
import { isCountryCode } from "@/lib/countries";

export const waitlistSchema = z.object({
  email: emailSchema,
  country: z
    .string()
    .trim()
    .toUpperCase()
    .refine((c) => c === "" || isCountryCode(c), "Please choose your country from the list.")
    .transform((c) => c || null),
  interest: z.enum(["fan", "artist", "industry"]).catch("fan"),
});
