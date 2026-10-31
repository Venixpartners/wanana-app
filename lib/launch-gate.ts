// Before launch, the public sees only these pages.
const PUBLIC_PATHS = new Set(["/", "/privacy"]);

// The team can sign in before launch. Sign up stays closed, so the public can't create accounts yet.
const TEAM_PATHS = new Set(["/signin", "/forgot-password", "/reset-password", "/auth/callback", "/auth/signout", "/onboarding", "/me", "/settings/profile"]);

export type GateDecision = "allow" | "admin_only";

/** What the coming soon gate does with a path. Admins can reach every page. */
export function gateFor(path: string): GateDecision {
  return PUBLIC_PATHS.has(path) || TEAM_PATHS.has(path) ? "allow" : "admin_only";
}
