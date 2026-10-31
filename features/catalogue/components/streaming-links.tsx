import { ArrowUpRight } from "lucide-react";
import { orderedLinks } from "../platforms";

/** Buttons that open the song, release or artist on each streaming app. Nothing plays on Wanana. */
export function StreamingLinks({ links, title }: { links: Record<string, string>; title: string }) {
  const items = orderedLinks(links);
  if (!items.length) {
    return <p className="text-sm text-mist">Streaming links will appear here soon.</p>;
  }
  return (
    <div>
      <p className="mb-3 text-sm text-mist">Listen on</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((p) => (
          <li key={p.key}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`Open ${title} on ${p.label}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm transition hover:border-mist"
            >
              {p.label}
              <ArrowUpRight size={14} aria-hidden="true" className="text-mist" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
