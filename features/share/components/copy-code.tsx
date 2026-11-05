"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Read only code box with a copy button, for the embed snippet. */
export function CopyCode({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the code can still be selected by hand.
    }
  }
  return (
    <div>
      <label className="label" htmlFor={`code-${label}`}>
        {label}
      </label>
      <textarea id={`code-${label}`} readOnly rows={3} value={code} onFocus={(e) => e.currentTarget.select()} className="field font-mono text-xs" />
      <button type="button" onClick={copy} className="btn-quiet mt-2 gap-1.5">
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        {copied ? "Copied" : "Copy code"}
      </button>
    </div>
  );
}
