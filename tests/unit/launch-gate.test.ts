import { describe, expect, it } from "vitest";
import { gateFor } from "@/lib/launch-gate";

describe("coming soon gate", () => {
  it("lets the public see the home and privacy pages", () => {
    expect(gateFor("/")).toBe("allow");
    expect(gateFor("/privacy")).toBe("allow");
  });
  it("lets the team sign in but keeps sign up closed", () => {
    for (const p of ["/signin", "/forgot-password", "/reset-password", "/auth/callback", "/onboarding", "/me"]) expect(gateFor(p)).toBe("allow");
    expect(gateFor("/signup")).toBe("admin_only");
  });
  it("keeps everything else for admins", () => {
    for (const p of ["/admin", "/admin/catalogue", "/artist/x", "/song/x", "/community", "/api/catalogue-search"]) expect(gateFor(p)).toBe("admin_only");
  });
});
