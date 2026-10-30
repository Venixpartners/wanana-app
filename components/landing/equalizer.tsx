// Animated level bars. Motion stops for people who prefer reduced motion.
const BARS = [0.55, 0.9, 0.4, 0.75, 1, 0.6, 0.85, 0.35, 0.7, 0.95, 0.5, 0.8];

export function Equalizer({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-10 items-end gap-[3px] ${className}`}>
      {BARS.map((h, i) => (
        <span
          key={i}
          className="eq-bar w-[5px] origin-bottom rounded-full bg-emerald-bright"
          style={{ height: `${h * 100}%`, animationDelay: `${(i % 6) * -0.17}s`, animationDuration: `${0.9 + (i % 4) * 0.18}s` }}
        />
      ))}
    </div>
  );
}
