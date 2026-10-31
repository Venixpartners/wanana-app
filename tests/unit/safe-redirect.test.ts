import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/safe-redirect";

describe("safeNextPath", () => {
  it("keeps paths on this site", () => {
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
    expect(safeNextPath("/me?tab=reviews")).toBe("/me?tab=reviews");
  });
  it("falls back for missing values", () => {
    expect(safeNextPath(null)).toBe("/onboarding");
    expect(safeNextPath("")).toBe("/onboarding");
  });
  it("blocks other hosts", () => {
    expect(safeNextPath("https://evil.example")).toBe("/onboarding");
    expect(safeNextPath("//evil.example")).toBe("/onboarding");
    expect(safeNextPath("/\\evil.example")).toBe("/onboarding");
    expect(safeNextPath("/me\r\nSet-Cookie: x")).toBe("/onboarding");
  });
});
