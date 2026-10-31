import { describe, expect, it } from "vitest";
import { waitlistSchema } from "@/features/waitlist/schema";

describe("waitlistSchema", () => {
  it("accepts a fan with no country", () => {
    expect(waitlistSchema.parse({ email: "Fan@Example.com", country: "", interest: "fan" })).toEqual({
      email: "fan@example.com",
      country: null,
      interest: "fan",
    });
  });
  it("falls back to fan for unknown interests", () => {
    expect(waitlistSchema.parse({ email: "a@b.co", country: "gb", interest: "hacker" }).interest).toBe("fan");
  });
  it("rejects invented country codes", () => {
    expect(waitlistSchema.safeParse({ email: "a@b.co", country: "ZZ", interest: "fan" }).success).toBe(false);
  });
});
