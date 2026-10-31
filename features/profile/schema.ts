import { z } from "zod";
import { isCountryCode } from "@/lib/countries";

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((h) => h.replace(/^@/, ""))
  .pipe(z.string().regex(/^[a-z0-9_]{3,20}$/, "Use 3 to 20 lowercase letters, numbers or underscores."));

export const profileSchema = z.object({
  handle: handleSchema,
  display_name: z.string().trim().min(1, "Add the name you want shown.").max(40, "Keep your name to 40 characters."),
  country_code: z
    .string()
    .trim()
    .toUpperCase()
    .refine((c) => isCountryCode(c), "Choose your country."),
  city: z
    .string()
    .trim()
    .max(60, "That city name is too long.")
    .transform((c) => c || null),
  bio: z
    .string()
    .trim()
    .max(160, "Keep your bio to 160 characters.")
    .transform((b) => b || null),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function avatarUrlPrefix(supabaseUrl: string, userId: string) {
  return `${supabaseUrl}/storage/v1/object/public/profile-photos/${userId}/`;
}

/** First error message per field, for showing next to inputs. */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "form");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}
