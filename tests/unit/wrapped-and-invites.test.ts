import { describe, expect, test } from "vitest";
import { agreementWord, currentMonthKey, parsePeriod, recentPeriods } from "@/features/wrapped/periods";
import { shareKindOf, storyCardPath } from "@/features/share/links";

const now = new Date("2026-11-05T12:00:00Z");

describe("wrapped periods", () => {
  test("months and years", () => {
    expect(parsePeriod("2026-11", now)).toEqual({ key: "2026-11", kind: "month", from: "2026-11-01", to: "2026-11-30", label: "November 2026" });
    expect(parsePeriod("2026-02", now)?.to).toBe("2026-02-28");
    expect(parsePeriod("2026", now)).toMatchObject({ kind: "year", from: "2026-01-01", to: "2026-12-31" });
  });
  test("no future, no before 2026, no junk", () => {
    expect(parsePeriod("2026-12", now)).toBeNull();
    expect(parsePeriod("2027", now)).toBeNull();
    expect(parsePeriod("2025-12", now)).toBeNull();
    expect(parsePeriod("2026-13", now)).toBeNull();
    expect(parsePeriod("nov", now)).toBeNull();
  });
  test("lagos month rolls over at local midnight", () => {
    expect(currentMonthKey(new Date("2026-11-30T23:30:00Z"))).toBe("2026-12");
    expect(currentMonthKey(now)).toBe("2026-11");
  });
  test("recent periods", () => {
    expect(recentPeriods(now)).toEqual(["2026-11", "2026-10", "2026-09", "2026-08", "2026-07", "2026-06", "2026"]);
    expect(recentPeriods(new Date("2026-02-10T12:00:00Z"))).toEqual(["2026-02", "2026-01", "2026"]);
  });
  test("agreement words", () => {
    expect(agreementWord(null)).toMatch(/Not enough/);
    expect(agreementWord(95)).toBe("Totally in step");
    expect(agreementWord(50)).toBe("Proper contrarian");
  });
});

describe("invite and wrapped sharing", () => {
  test("kinds and story paths", () => {
    expect(shareKindOf("/join/detroyx")).toBe("invite");
    expect(shareKindOf("/wrapped/detroyx/2026-11")).toBe("wrapped");
    expect(storyCardPath("/join/detroyx")).toBe("/card/join/detroyx");
    expect(storyCardPath("/wrapped/detroyx/2026-11")).toBe("/card/wrapped/detroyx/2026-11");
  });
});
