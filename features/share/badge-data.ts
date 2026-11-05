import { getArtistPage, getReleasePage, getTrackPage } from "@/features/catalogue/queries";
import { fanPulse, type Pulse } from "@/features/pulse/queries";
import type { BadgeData } from "./card";

export type KitKind = "artist" | "album" | "song";

export function isKitKind(v: string): v is KitKind {
  return v === "artist" || v === "album" || v === "song";
}

function fromPulse(name: string, sub: string | undefined, p: Pulse): BadgeData {
  return { name, sub, pulse: p.all?.pulse ?? null, average: p.all?.average ?? null, ratings: p.all?.ratings ?? 0, home: p.home?.pulse ?? null, diaspora: p.diaspora?.pulse ?? null };
}

/** Live score for a published artist, release or song, for badges and the embed box. */
export async function scoreFor(kind: KitKind, slug: string): Promise<(BadgeData & { href: string }) | null> {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  if (kind === "artist") {
    const d = await getArtistPage(slug);
    if (!d?.artist.is_published) return null;
    return { ...fromPulse(d.artist.name, d.artist.genres.slice(0, 2).join(", ") || undefined, await fanPulse("artist", d.artist.id)), href: `/artist/${slug}` };
  }
  if (kind === "album") {
    const d = await getReleasePage(slug);
    if (!d?.release.is_published) return null;
    return { ...fromPulse(d.release.title, d.artist.name, await fanPulse("release", d.release.id)), href: `/album/${slug}` };
  }
  const d = await getTrackPage(slug);
  if (!d?.track.is_published) return null;
  return { ...fromPulse(d.track.title, d.artist.name, await fanPulse("track", d.track.id)), href: `/song/${slug}` };
}
