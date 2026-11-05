export const SHARE_CHANNELS = ["whatsapp", "x", "facebook", "instagram", "tiktok", "copy", "native", "image"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export const SHARE_KINDS = ["song", "album", "artist", "poll", "ranking", "review", "chart", "profile"] as const;
export type ShareKind = (typeof SHARE_KINDS)[number];

const PREFIX: [string, ShareKind][] = [
  ["/song/", "song"],
  ["/album/", "album"],
  ["/artist/", "artist"],
  ["/polls/", "poll"],
  ["/rankings/", "ranking"],
  ["/reviews/", "review"],
  ["/charts", "chart"],
  ["/u/", "profile"],
];

/** What a Wanana path is about, for share tracking. */
export function shareKindOf(path: string): ShareKind | null {
  for (const [p, kind] of PREFIX) if (path.startsWith(p)) return kind;
  return null;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** A ten character share code, made in the browser so the share sheet can open straight away. */
export function newShareCode(random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))) {
  return Array.from(random(10), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function isShareCode(v: unknown): v is string {
  return typeof v === "string" && /^[a-z0-9]{10}$/.test(v);
}

/** The page link with the share code on it. */
export function trackedUrl(origin: string, path: string, code: string) {
  const url = new URL(path, origin);
  url.searchParams.set("s", code);
  return url.toString();
}

/** Where each share button sends people. Copy, native and image are handled in the browser. */
export function channelUrl(channel: ShareChannel, url: string, text: string): string | null {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (channel) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "x":
      return `https://x.com/intent/post?text=${t}&url=${u}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    default:
      return null;
  }
}

/** The tall image for Instagram and TikTok stories, for a page that has one. */
export function storyCardPath(path: string): string | null {
  const kind = shareKindOf(path);
  if (!kind || kind === "profile") return null;
  return `/card${path.split("?")[0]}`;
}
