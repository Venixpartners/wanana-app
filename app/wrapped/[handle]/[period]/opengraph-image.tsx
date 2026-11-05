import { renderCard, CARD_SIZES, FALLBACK_CARD } from "@/features/share/card";
import { cardFor } from "@/features/share/card-data";

export const alt = "Wanana Wrapped";
export const size = CARD_SIZES.wide;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ handle: string; period: string }> }) {
  const { handle, period } = await params;
  return renderCard((await cardFor("wrapped", `${handle.toLowerCase()}/${period}`)) ?? FALLBACK_CARD);
}
