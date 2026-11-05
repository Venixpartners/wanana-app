import { renderCard, CARD_SIZES, FALLBACK_CARD } from "@/features/share/card";
import { cardFor } from "@/features/share/card-data";

export const alt = "This week's Wanana Chart";
export const size = CARD_SIZES.wide;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ chart: string }> }) {
  const { chart } = await params;
  return renderCard((await cardFor("charts", chart)) ?? FALLBACK_CARD);
}
