/** Only allow redirects to paths on this site, never to another host. */
export function safeNextPath(next: string | null | undefined, fallback = "/onboarding"): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\r\n\t]/.test(next)) return fallback;
  return next;
}
