export type Period = { key: string; kind: "month" | "year"; from: string; to: string; label: string };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function lagosToday(now = new Date()) {
  return new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** "2026" for a year or "2026-11" for a month. Nothing before 2026 or after the current month. */
export function parsePeriod(key: string, now = new Date()): Period | null {
  const today = lagosToday(now);
  const y = /^(\d{4})$/.exec(key);
  if (y) {
    const year = Number(y[1]);
    if (year < 2026 || `${year}` > today.slice(0, 4)) return null;
    return { key, kind: "year", from: `${year}-01-01`, to: `${year}-12-31`, label: `${year}` };
  }
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (year < 2026 || month < 1 || month > 12 || key > today.slice(0, 7)) return null;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { key, kind: "month", from: `${key}-01`, to: `${key}-${String(last).padStart(2, "0")}`, label: `${MONTHS[month - 1]} ${year}` };
}

export function currentMonthKey(now = new Date()) {
  return lagosToday(now).slice(0, 7);
}

/** The current month and the five before it (from 2026), then the current year. */
export function recentPeriods(now = new Date()): string[] {
  const [y, m] = currentMonthKey(now).split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const key = d.toISOString().slice(0, 7);
    if (key >= "2026-01") out.push(key);
  }
  out.push(String(y));
  return out;
}

/** How closely a fan's scores match a crowd, in words. */
export function agreementWord(pct: number | null) {
  if (pct === null) return "Not enough scores to compare";
  if (pct >= 90) return "Totally in step";
  if (pct >= 80) return "Mostly agree";
  if (pct >= 65) return "Your own lane";
  return "Proper contrarian";
}
