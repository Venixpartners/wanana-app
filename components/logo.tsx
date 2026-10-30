import Link from "next/link";

// Signal W mark plus the lowercase wordmark in Sora, matching the founder pack lockup.
export function Logo({ height = 28 }: { height?: number }) {
  return (
    <Link href="/" aria-label="Wanana home" className="inline-flex items-center gap-[0.55em]" style={{ fontSize: height }}>
      <svg viewBox="0 6 200 68" className="h-[1em] w-auto" aria-hidden="true">
        <path d="M6 48 H46 L62 12 L80 68 L98 30 L116 68 L134 12 L150 48 H180" fill="none" stroke="#0E7C66" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="192" cy="48" r="6" fill="#FF6A3D" />
      </svg>
      <span className="font-display text-[0.78em] font-semibold leading-none tracking-tight text-paper">wanana</span>
    </Link>
  );
}
