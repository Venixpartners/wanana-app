/** What a bracket round is called, from how many entries the bracket started with. */
export function roundName(size: number, round: number) {
  const left = size / 2 ** (round - 1);
  if (left <= 2) return "Final";
  if (left === 4) return "Semi final";
  if (left === 8) return "Quarter final";
  return `Round of ${left}`;
}

export function roundCount(size: number) {
  return Math.round(Math.log2(size));
}

/** Time left on an open battle, in words. */
export function timeLeft(closesAt: string, now = Date.now()) {
  const ms = new Date(closesAt).getTime() - now;
  if (ms <= 0) return "Closed";
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const rest = hours % 24;
    return rest ? `${days}d ${rest}h left` : `${days}d left`;
  }
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(1, Math.ceil(ms / 60_000))}m left`;
}

/** Whole number shares of two counts that add up to 100. */
export function split(a: number, b: number): [number, number] {
  const total = a + b;
  if (!total) return [0, 0];
  const pa = Math.round((a / total) * 100);
  return [pa, 100 - pa];
}

/** One line on how home and diaspora fans differ in a battle, or null when there is nothing to say. */
export function splitLine(names: [string, string], home: [number, number], diaspora: [number, number]) {
  const h = home[0] + home[1];
  const d = diaspora[0] + diaspora[1];
  if (h < 1 || d < 1) return null;
  const homePick = home[0] === home[1] ? null : home[0] > home[1] ? 0 : 1;
  const awayPick = diaspora[0] === diaspora[1] ? null : diaspora[0] > diaspora[1] ? 0 : 1;
  if (homePick === null || awayPick === null) return null;
  if (homePick === awayPick) return `Home and diaspora fans both back ${names[homePick]}.`;
  return `Home fans back ${names[homePick]}, the diaspora backs ${names[awayPick]}.`;
}
