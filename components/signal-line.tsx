// The Signal W drawn as a divider. The W keeps its shape; only the flat lines stretch.
export function SignalLine({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center px-6 ${className}`}>
      <span className="h-0.5 flex-1 rounded-full bg-current" />
      <svg viewBox="44 8 108 80" className="-mx-px h-12 w-[65px] shrink-0 overflow-visible" fill="none">
        <path
          d="M44 48 H46 L62 12 L80 68 L98 30 L116 68 L134 12 L150 48 H152"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="h-0.5 flex-1 rounded-full bg-current" />
      <span className="ml-3 size-2 shrink-0 rounded-full bg-orange" />
    </div>
  );
}
