import { Search } from "lucide-react";

/** Plain GET form so search works without JavaScript and results can be shared by link. */
export function SearchBox({ defaultValue = "", autoFocus = false, size = "lg" }: { defaultValue?: string; autoFocus?: boolean; size?: "lg" | "sm" }) {
  return (
    <form action="/search" method="get" role="search" className="relative">
      <label htmlFor={`q-${size}`} className="sr-only">
        Search Wanana
      </label>
      <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
      <input
        id={`q-${size}`}
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        maxLength={80}
        placeholder="Search artists, songs, albums, people and discussions"
        className={`field pl-10 ${size === "sm" ? "py-2.5" : ""}`}
      />
    </form>
  );
}
