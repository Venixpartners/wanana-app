import { CoverArt } from "./cover-art";
import { Equalizer } from "./equalizer";

function SplitBar({ label, score, tone }: { label: string; score: number; tone: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-mist">{label}</span>
        <span className="font-display font-semibold tabular-nums">{score.toFixed(1)}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-line">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}

// Hero preview of a song page: what a fan sees after rating a track.
export function PulseCard() {
  return (
    <figure className="relative mx-auto w-full max-w-sm rounded-[28px] border border-line bg-ink p-5 shadow-[0_30px_80px_-30px_rgba(14,124,102,0.45)] sm:p-6">
      <div className="flex gap-4">
        <CoverArt variant={0} className="size-24 shrink-0 rounded-2xl sm:size-28" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-mist">Single, 2026</p>
          <p className="mt-1 truncate font-display text-xl font-semibold">Danfo Dreams</p>
          <p className="truncate text-mist">Kemi Sol</p>
          <Equalizer className="mt-3" />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
        <div>
          <p className="text-sm text-mist">Fan Pulse</p>
          <p className="font-display text-5xl font-semibold leading-none tabular-nums">
            8.6<span className="ml-1 text-lg text-mist">/10</span>
          </p>
        </div>
        <p className="text-right text-sm text-mist">
          2,418 ratings
          <br />
          this week
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <SplitBar label="Home (Nigeria)" score={8.9} tone="bg-emerald-bright" />
        <SplitBar label="Diaspora" score={8.1} tone="bg-gold" />
      </div>

      <figcaption className="mt-5 text-xs text-mist/80">Sample data. Song and artist are made up.</figcaption>
    </figure>
  );
}
