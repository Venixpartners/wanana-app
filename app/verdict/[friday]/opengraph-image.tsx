import { renderCard, CARD_SIZES, FALLBACK_CARD } from "@/features/share/card";
import { cardFor } from "@/features/share/card-data";

export const alt = "The Fan Verdict on Wanana";
export const size = CARD_SIZES.wide;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ friday: string }> }) {
  const { friday } = await params;
  return renderCard((await cardFor("verdict", friday)) ?? FALLBACK_CARD);
}
