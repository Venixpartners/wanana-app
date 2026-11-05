import { renderCard, CARD_SIZES, FALLBACK_CARD } from "@/features/share/card";
import { cardFor } from "@/features/share/card-data";

export const alt = "Fan Pulse for this song on Wanana";
export const size = CARD_SIZES.wide;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderCard((await cardFor("song", slug)) ?? FALLBACK_CARD);
}
