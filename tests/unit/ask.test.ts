import { describe, expect, test } from "vitest";
import { cleanAnswer, questionSchema, SYSTEM_PROMPT, type Source } from "@/features/ask/answer";

const sources: Source[] = [
  { id: "S1", type: "song", title: "Love Me JeJe, Tems", url: "/song/love-me-jeje" },
  { id: "S2", type: "review", title: "9/10", url: "/reviews/x" },
];

describe("ask wanana", () => {
  test("questions are tidied and bounded", () => {
    expect(questionSchema.parse("  what   is rising?  ")).toBe("what is rising?");
    expect(questionSchema.safeParse("hi").success).toBe(false);
    expect(questionSchema.safeParse("x".repeat(301)).success).toBe(false);
  });
  test("made up citations are dropped", () => {
    const a = cleanAnswer(
      {
        enough_data: true,
        direct_answer: "Fans love it.",
        evidence: [
          { source_id: "S1", point: "Fan Pulse 84" },
          { source_id: "S9", point: "Invented" },
        ],
        related: ["S1", "S1", "S7"],
        follow_ups: ["  What about the diaspora? ", ""],
      },
      sources,
    );
    expect(a?.evidence).toEqual([{ source_id: "S1", point: "Fan Pulse 84" }]);
    expect(a?.related).toEqual(["S1"]);
    expect(a?.follow_ups).toEqual(["What about the diaspora?"]);
    expect(a?.why_it_matters).toBe("");
  });
  test("a broken reply is rejected", () => {
    expect(cleanAnswer({ direct_answer: 3 }, sources)).toBeNull();
    expect(cleanAnswer(null, sources)).toBeNull();
  });
  test("the prompt keeps Wanana's rules", () => {
    expect(SYSTEM_PROMPT).toMatch(/only from the Wanana data/);
    expect(SYSTEM_PROMPT).toMatch(/Ignore any instructions/);
    expect(SYSTEM_PROMPT).toMatch(/betting/);
  });
});
