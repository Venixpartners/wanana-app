import { describe, expect, test } from "vitest";
import { roundCount, roundName, split, splitLine, timeLeft } from "@/features/versus/rounds";
import { isFriday, liveFriday, verdictDateText } from "@/features/verdict/queries";
import { shareKindOf, storyCardPath } from "@/features/share/links";

describe("versus rounds", () => {
  test("round names", () => {
    expect(roundName(16, 1)).toBe("Round of 16");
    expect(roundName(16, 2)).toBe("Quarter final");
    expect(roundName(8, 2)).toBe("Semi final");
    expect(roundName(4, 2)).toBe("Final");
    expect(roundCount(8)).toBe(3);
  });
  test("split adds up to 100", () => {
    expect(split(0, 0)).toEqual([0, 0]);
    expect(split(1, 2)).toEqual([33, 67]);
    expect(split(5, 5)).toEqual([50, 50]);
  });
  test("time left", () => {
    const now = Date.parse("2026-11-05T12:00:00Z");
    expect(timeLeft("2026-11-07T15:00:00Z", now)).toBe("2d 3h left");
    expect(timeLeft("2026-11-05T17:30:00Z", now)).toBe("5h left");
    expect(timeLeft("2026-11-05T12:20:00Z", now)).toBe("20m left");
    expect(timeLeft("2026-11-05T11:00:00Z", now)).toBe("Closed");
  });
  test("home and diaspora line", () => {
    expect(splitLine(["One", "Two"], [5, 2], [1, 4])).toBe("Home fans back One, the diaspora backs Two.");
    expect(splitLine(["One", "Two"], [5, 2], [4, 1])).toBe("Home and diaspora fans both back One.");
    expect(splitLine(["One", "Two"], [5, 2], [0, 0])).toBeNull();
    expect(splitLine(["One", "Two"], [2, 2], [1, 3])).toBeNull();
  });
});

describe("fan verdict dates", () => {
  test("fridays only", () => {
    expect(isFriday("2026-10-30")).toBe(true);
    expect(isFriday("2026-10-31")).toBe(false);
    expect(isFriday("2026-02-30")).toBe(false);
    expect(isFriday("30-10-2026")).toBe(false);
  });
  test("live weekend in Lagos time", () => {
    expect(liveFriday(new Date("2026-11-06T09:00:00Z"))).toBe("2026-11-06");
    expect(liveFriday(new Date("2026-11-08T22:30:00Z"))).toBe("2026-11-06");
    expect(liveFriday(new Date("2026-11-08T23:30:00Z"))).toBeNull();
    expect(liveFriday(new Date("2026-11-05T23:30:00Z"))).toBe("2026-11-06");
    expect(liveFriday(new Date("2026-11-04T12:00:00Z"))).toBeNull();
  });
  test("date text", () => {
    expect(verdictDateText("2026-10-30")).toBe("30 October 2026");
  });
});

describe("sharing versus and verdict", () => {
  test("kinds and story paths", () => {
    expect(shareKindOf("/versus/abc")).toBe("versus");
    expect(shareKindOf("/versus/bracket/song-of-the-summer")).toBe("versus");
    expect(shareKindOf("/verdict")).toBe("verdict");
    expect(storyCardPath("/verdict")).toBe("/card/verdict/latest");
    expect(storyCardPath("/verdict/2026-10-30")).toBe("/card/verdict/2026-10-30");
    expect(storyCardPath("/versus/bracket/x")).toBe("/card/versus/bracket/x");
  });
});
