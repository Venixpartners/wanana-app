import { Mic, Sparkles } from "lucide-react";
import { BADGE_INFO, type BadgeKey } from "../badges";

/** Small status chips. "compact" is for author lines. */
export function BadgeChips({ badges, compact = false }: { badges?: BadgeKey[]; compact?: boolean }) {
  if (!badges?.length) return null;
  const order: BadgeKey[] = ["voice", "founding_fan"];
  return (
    <>
      {order
        .filter((b) => badges.includes(b))
        .map((b) => {
          const Icon = b === "voice" ? Mic : Sparkles;
          return (
            <span
              key={b}
              title={BADGE_INFO[b].about}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/50 text-gold ${compact ? "px-1.5 py-0 text-[11px]" : "px-2.5 py-0.5 text-xs"}`}
            >
              <Icon size={compact ? 11 : 13} aria-hidden="true" />
              {BADGE_INFO[b].label}
            </span>
          );
        })}
    </>
  );
}
