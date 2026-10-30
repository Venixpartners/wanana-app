// Abstract record sleeve art for sample tracks. No real artwork is used.
const PALETTES = [
  ["#0E7C66", "#F4B942", "#FF6A3D"],
  ["#FF6A3D", "#0E7C66", "#F6F4EF"],
  ["#F4B942", "#FF6A3D", "#0B0F13"],
  ["#19A486", "#0B0F13", "#F4B942"],
  ["#F6F4EF", "#0E7C66", "#FF6A3D"],
];

export function CoverArt({ variant = 0, className = "" }: { variant?: number; className?: string }) {
  const [a, b, c] = PALETTES[variant % PALETTES.length];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" fill={a} />
      <circle cx={30 + variant * 9} cy={62 - variant * 5} r="46" fill={b} />
      <circle cx={30 + variant * 9} cy={62 - variant * 5} r="22" fill={a} />
      <path
        d="M8 70 H28 L36 52 L45 80 L54 61 L63 80 L72 52 L80 70 H92"
        fill="none"
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
