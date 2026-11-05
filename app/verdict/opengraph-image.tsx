import { renderCard, CARD_SIZES, FALLBACK_CARD } from "@/features/share/card";
import { cardFor } from "@/features/share/card-data";

export const alt = "The Fan Verdict on Wanana";
export const size = CARD_SIZES.wide;
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image() {
  return renderCard((await cardFor("verdict", "latest")) ?? FALLBACK_CARD);
}
