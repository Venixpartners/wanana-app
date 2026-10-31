/** Streaming and video platforms Wanana links out to. Wanana itself never plays music. */
export const PLATFORMS = [
  { key: "spotify", label: "Spotify", hosts: ["open.spotify.com"] },
  { key: "apple_music", label: "Apple Music", hosts: ["music.apple.com"] },
  { key: "audiomack", label: "Audiomack", hosts: ["audiomack.com"] },
  { key: "boomplay", label: "Boomplay", hosts: ["boomplay.com", "www.boomplay.com", "boomplay.page.link"] },
  { key: "youtube", label: "YouTube", hosts: ["youtube.com", "www.youtube.com", "youtu.be", "music.youtube.com"] },
  { key: "deezer", label: "Deezer", hosts: ["deezer.com", "www.deezer.com", "deezer.page.link"] },
  { key: "tidal", label: "TIDAL", hosts: ["tidal.com", "listen.tidal.com"] },
  { key: "amazon_music", label: "Amazon Music", hosts: ["music.amazon.com", "music.amazon.co.uk"] },
  { key: "soundcloud", label: "SoundCloud", hosts: ["soundcloud.com", "on.soundcloud.com"] },
] as const;

export type PlatformKey = (typeof PLATFORMS)[number]["key"];
export type Links = Partial<Record<PlatformKey, string>>;

/** Accepts only https links on the platform's own domain. Returns the cleaned URL or null. */
export function cleanPlatformUrl(key: PlatformKey, raw: string): string | null {
  const platform = PLATFORMS.find((p) => p.key === key);
  if (!platform || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    if (!(platform.hosts as readonly string[]).includes(url.hostname.toLowerCase())) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/** Links in a fixed, familiar order for display. */
export function orderedLinks(links: Record<string, unknown> | null | undefined) {
  return PLATFORMS.filter((p) => typeof links?.[p.key] === "string").map((p) => ({ ...p, url: links![p.key] as string }));
}
