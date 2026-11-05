export const CHARTS = ["fan", "nigeria", "diaspora", "rising"] as const;
export type ChartName = (typeof CHARTS)[number];

export const CHART_INFO: Record<ChartName, { title: string; short: string; about: string }> = {
  fan: { title: "Fan Chart", short: "Fan", about: "Every fan's scores, wherever they are. Ranked by Fan Pulse and how much fans are rating and talking about each song this month." },
  nigeria: { title: "Nigeria Chart", short: "Nigeria", about: "The same ranking, counting only fans in Nigeria." },
  diaspora: { title: "Diaspora Chart", short: "Diaspora", about: "The same ranking, counting only fans living outside Nigeria." },
  rising: { title: "Rising", short: "Rising", about: "Songs gaining fan scores fastest this week compared with last week." },
};

export function isChart(v: string): v is ChartName {
  return (CHARTS as readonly string[]).includes(v);
}

export type Movement = { kind: "new" | "up" | "down" | "same"; by: number };

/** How a song moved since this week's snapshot. No previous position means it is new. */
export function movement(position: number, last: number | null): Movement {
  if (last === null) return { kind: "new", by: 0 };
  if (last > position) return { kind: "up", by: last - position };
  if (last < position) return { kind: "down", by: position - last };
  return { kind: "same", by: 0 };
}

export function movementText(m: Movement) {
  if (m.kind === "new") return "New";
  if (m.kind === "same") return "No change";
  return `${m.kind === "up" ? "Up" : "Down"} ${m.by}`;
}

/** A short reading of a Fan Pulse score. */
export function pulseWord(pulse: number | null) {
  if (pulse === null) return "No scores yet";
  if (pulse >= 85) return "Fans love it";
  if (pulse >= 75) return "Strong";
  if (pulse >= 65) return "Warm";
  if (pulse >= 55) return "Mixed";
  return "Cool";
}

/** Fewer than this many ratings and the pulse is shown as early. */
export const SETTLED_AT = 10;

/** Home versus diaspora gap, described the way a fan would say it. */
export function splitText(home: number | null, diaspora: number | null) {
  if (home === null || diaspora === null) return null;
  const gap = home - diaspora;
  if (Math.abs(gap) < 3) return "Fans at home and abroad agree on this one.";
  return gap > 0 ? `Landing ${gap} points stronger at home than abroad.` : `Landing ${-gap} points stronger abroad than at home.`;
}
