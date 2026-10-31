"use client";

import { useState } from "react";

/** Uses the phone's share sheet where there is one, otherwise copies the link. */
export function ShareButton({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The person closed the share sheet.
    }
  }
  return (
    <button type="button" onClick={share} className="inline-flex items-center rounded-full border border-line px-3 py-1.5 text-sm text-mist transition hover:border-mist hover:text-paper">
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
