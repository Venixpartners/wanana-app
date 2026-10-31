export function formatDuration(seconds?: number | null) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/** "3:45" or "225" to seconds. Empty input gives null; nonsense gives NaN. */
export function parseDuration(input: string): number | null {
  const t = input.trim();
  if (!t) return null;
  const m = /^(\d{1,3}):([0-5]\d)$/.exec(t);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  if (/^\d{1,4}$/.test(t)) return Number(t);
  return NaN;
}

export const KIND_LABEL: Record<string, string> = { album: "Album", ep: "EP", single: "Single", mixtape: "Mixtape" };

export function releaseYear(date?: string | null) {
  return date ? date.slice(0, 4) : "";
}

export function formatReleaseDate(date?: string | null) {
  if (!date) return "";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
