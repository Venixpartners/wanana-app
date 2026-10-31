import { z } from "zod";
import { isCountryCode } from "@/lib/countries";
import { PLATFORMS, cleanPlatformUrl, type Links } from "./platforms";
import { parseDuration } from "./format";

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => v || null);

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a full date.")
  .transform((v) => v || null);

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => v === "" || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v), "Use lowercase letters, numbers and single dashes.")
  .transform((v) => v || null);

/** Reads link_<platform> fields. Bad links are reported per field rather than silently dropped. */
export function readLinks(form: FormData): { links: Links; errors: Record<string, string> } {
  const links: Links = {};
  const errors: Record<string, string> = {};
  for (const p of PLATFORMS) {
    const raw = String(form.get(`link_${p.key}`) ?? "").trim();
    if (!raw) continue;
    const clean = cleanPlatformUrl(p.key, raw);
    if (clean) links[p.key] = clean;
    else errors[`link_${p.key}`] = `Paste a full ${p.label} link starting with https://`;
  }
  return { links, errors };
}

export const artistSchema = z.object({
  name: z.string().trim().min(1, "Add the artist's name.").max(120, "Keep the name to 120 characters."),
  slug: slugField,
  country_code: z
    .string()
    .trim()
    .toUpperCase()
    .refine((c) => c === "" || isCountryCode(c), "Choose a country from the list.")
    .transform((c) => c || null),
  genres: z
    .string()
    .transform((g) =>
      Array.from(new Set(g.split(",").map((x) => x.trim()).filter(Boolean))).map((x) => x.slice(0, 40)),
    )
    .refine((g) => g.length <= 6, "Pick up to 6 genres."),
  summary: optionalText(600, "Keep the summary to 600 characters."),
  is_published: z.boolean(),
});

export const releaseSchema = z.object({
  title: z.string().trim().min(1, "Add the title.").max(160, "Keep the title to 160 characters."),
  slug: slugField,
  artist_id: z.uuid("Choose the artist."),
  kind: z.enum(["album", "ep", "single", "mixtape"]),
  release_date: optionalDate,
  label: optionalText(120, "Keep the label name to 120 characters."),
  upc: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{12,14}$/.test(v), "A UPC is 12 to 14 digits.")
    .transform((v) => v || null),
  is_published: z.boolean(),
});

export const trackSchema = z.object({
  title: z.string().trim().min(1, "Add the song title.").max(160, "Keep the title to 160 characters."),
  slug: slugField,
  artist_id: z.uuid("Choose the main artist."),
  release_id: z
    .string()
    .trim()
    .refine((v) => v === "" || z.uuid().safeParse(v).success, "Choose a release from the list.")
    .transform((v) => v || null),
  track_number: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) >= 1 && Number(v) <= 200), "Use a number from 1 to 200.")
    .transform((v) => (v ? Number(v) : null)),
  isrc: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => v === "" || /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(v), "An ISRC looks like NGA1B2600001.")
    .transform((v) => v || null),
  duration: z
    .string()
    .transform((v) => parseDuration(v))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 1 && v <= 7200), "Use minutes and seconds, like 3:45."),
  release_date: optionalDate,
  featured_ids: z.array(z.uuid()).max(10, "Up to 10 featured artists."),
  is_published: z.boolean(),
});

export function formToObject(form: FormData, keys: string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = String(form.get(k) ?? "");
  out.is_published = form.get("is_published") === "on";
  return out;
}
