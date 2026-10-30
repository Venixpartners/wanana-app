import { CoverArt } from "./cover-art";

const ROWS = [
  { title: "Danfo Dreams", artist: "Kemi Sol", score: 8.6, move: "Up 2" },
  { title: "Owambe Season", artist: "Tunde Wave", score: 8.4, move: "New" },
  { title: "Gidi Nights", artist: "Amara Lux", score: 8.3, move: "Down 1" },
  { title: "Harmattan Love", artist: "Ife and the Bridge", score: 8.1, move: "Up 5" },
  { title: "Lagos Rain", artist: "Sola Ray", score: 7.9, move: "Down 2" },
];

const moveTone = (m: string) => (m.startsWith("Up") ? "text-emerald-bright" : m === "New" ? "text-orange" : "text-mist");

export function ChartPreview() {
  return (
    <div className="rounded-3xl border border-line bg-ink">
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
        <p className="font-display font-semibold">Fan Chart</p>
        <p className="text-sm text-mist">Week 44</p>
      </div>
      <ol>
        {ROWS.map((r, i) => (
          <li key={r.title} className="flex items-center gap-4 border-b border-line/60 px-5 py-3.5 last:border-0 sm:px-6">
            <span className={`w-6 text-center font-display text-lg font-semibold tabular-nums ${i === 0 ? "text-gold" : "text-mist"}`}>{i + 1}</span>
            <CoverArt variant={i} className="size-11 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.title}</p>
              <p className="truncate text-sm text-mist">{r.artist}</p>
            </div>
            <div className="text-right">
              <p className="font-display font-semibold tabular-nums">{r.score.toFixed(1)}</p>
              <p className={`text-xs ${moveTone(r.move)}`}>{r.move}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="px-5 pb-4 pt-1 text-xs text-mist/80 sm:px-6">Sample data. Songs and artists are made up.</p>
    </div>
  );
}
