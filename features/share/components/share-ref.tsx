"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isShareCode } from "../links";
import { openShareAction } from "../actions";

/** Counts a visit that arrived through a shared link, once per browser session, then tidies the address. */
export function ShareRef() {
  const params = useSearchParams();
  const pathname = usePathname();
  const code = params.get("s");
  useEffect(() => {
    if (!isShareCode(code)) return;
    const key = `wanana_open_${code}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing can block storage; counting once more is fine.
    }
    openShareAction(code).catch(() => {});
    const rest = new URLSearchParams(params.toString());
    rest.delete("s");
    const q = rest.toString();
    window.history.replaceState(null, "", `${pathname}${q ? `?${q}` : ""}${window.location.hash}`);
  }, [code, params, pathname]);
  return null;
}
