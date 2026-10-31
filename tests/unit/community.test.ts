import { describe, expect, it } from "vitest";
import { isUuid, likePattern, plural, timeAgo } from "@/lib/text";
import { percentages, pollSchema, closesAt } from "@/features/polls/schema";
import { average, reviewSchema } from "@/features/reviews/schema";
import { rankingSchema } from "@/features/rankings/schema";
import { discussionSchema, replySchema } from "@/features/discussions/schema";
import { rankByName, cleanQuery } from "@/features/search/queries";
import { readSubjectField, subjectColumns, subjectOf } from "@/features/community/subjects";
import { writeError } from "@/features/community/errors";

const ID = "6f1c2b9e-3a4d-4c5e-9f00-112233445566";

describe("text helpers", () => {
  it("escapes search patterns so user text can't widen the match", () => {
    expect(likePattern("50%_off")).toBe("%50\\%\\_off%");
    expect(likePattern('a,b(c)"')).toBe("%a b c%");
  });
  it("writes plurals and relative times", () => {
    expect(plural(1, "reply", "replies")).toBe("1 reply");
    expect(plural(3, "reply", "replies")).toBe("3 replies");
    const now = Date.parse("2026-10-31T12:00:00Z");
    expect(timeAgo("2026-10-31T11:59:40Z", now)).toBe("just now");
    expect(timeAgo("2026-10-31T11:00:00Z", now)).toBe("1 hour ago");
    expect(timeAgo("2026-10-29T12:00:00Z", now)).toBe("2 days ago");
  });
  it("recognises ids", () => {
    expect(isUuid(ID)).toBe(true);
    expect(isUuid("not-an-id")).toBe(false);
  });
});

describe("polls", () => {
  it("rounds percentages so they add up to 100", () => {
    expect(percentages([1, 1, 1])).toEqual([34, 33, 33]);
    expect(percentages([0, 0])).toEqual([0, 0]);
    expect(percentages([3, 1]).reduce((a, b) => a + b, 0)).toBe(100);
  });
  it("needs two different choices and drops blanks", () => {
    expect(pollSchema.safeParse({ question: "Best song so far?", options: ["One", ""], days: "7", genre: "" }).success).toBe(false);
    expect(pollSchema.safeParse({ question: "Best song so far?", options: ["One", "one"], days: "7", genre: "" }).success).toBe(false);
    const ok = pollSchema.parse({ question: "Best song so far?", options: ["One", "", "Two"], days: "", genre: "" });
    expect(ok.options).toEqual(["One", "Two"]);
  });
  it("works out closing times", () => {
    expect(closesAt("", 0)).toBeNull();
    expect(closesAt("1", 0)).toBe(new Date(86_400_000).toISOString());
  });
});

describe("reviews", () => {
  it("accepts a score on its own", () => {
    expect(reviewSchema.parse({ rating: "8", title: "", body: "" })).toEqual({ rating: 8, title: null, body: null });
  });
  it("rejects scores outside 1 to 10 and a headline with no review", () => {
    expect(reviewSchema.safeParse({ rating: "11", title: "", body: "" }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: "", title: "", body: "" }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: "7", title: "Big tune", body: "" }).success).toBe(false);
  });
  it("averages to one decimal place", () => {
    expect(average([])).toBeNull();
    expect(average([7, 8, 8])).toBe(7.7);
  });
});

describe("rankings and discussions", () => {
  it("needs entries and refuses duplicates", () => {
    const base = { title: "My top songs", description: "", is_public: true };
    expect(rankingSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(rankingSchema.safeParse({ ...base, items: [{ kind: "track", id: ID }, { kind: "track", id: ID }] }).success).toBe(false);
    expect(rankingSchema.safeParse({ ...base, items: [{ kind: "track", id: ID }, { kind: "artist", id: ID }] }).success).toBe(true);
  });
  it("validates discussion titles and replies", () => {
    expect(discussionSchema.safeParse({ title: "Hi", body: "x", genre: "" }).success).toBe(false);
    expect(discussionSchema.parse({ title: "Best verse on the album?", body: " Talk ", genre: "" })).toEqual({ title: "Best verse on the album?", body: "Talk", genre: null });
    expect(replySchema.safeParse({ body: "   " }).success).toBe(false);
  });
});

describe("search", () => {
  it("puts exact and starting matches first", () => {
    const names = ["Love Nwantiti", "Wizkid", "Love", "Endless Love"];
    expect(rankByName(names, "love", (n) => n)).toEqual(["Love", "Love Nwantiti", "Endless Love", "Wizkid"]);
  });
  it("tidies the query", () => {
    expect(cleanQuery(["  burna   boy ", "x"])).toBe("burna boy");
    expect(cleanQuery(undefined)).toBe("");
  });
});

describe("subjects and errors", () => {
  it("maps rows to and from subjects", () => {
    expect(subjectOf({ release_id: ID })).toEqual({ kind: "release", id: ID });
    expect(subjectOf({})).toBeNull();
    expect(subjectColumns({ kind: "track", id: ID })).toEqual({ artist_id: null, release_id: null, track_id: ID });
  });
  it("only trusts well formed subject fields", () => {
    const form = new FormData();
    form.set("subject_kind", "artist");
    form.set("subject_id", ID);
    expect(readSubjectField(form)).toEqual({ kind: "artist", id: ID });
    form.set("subject_kind", "profiles");
    expect(readSubjectField(form)).toBeNull();
  });
  it("explains database refusals in plain words", () => {
    expect(writeError({ message: "rate_limited" })).toMatch(/posting quickly/);
    expect(writeError({ code: "23505", message: "dup" })).toMatch(/already/);
  });
});
