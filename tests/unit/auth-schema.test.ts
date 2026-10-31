import { describe, expect, it } from "vitest";
import { emailSchema, passwordSchema, signUpSchema } from "@/features/auth/schema";

describe("emailSchema", () => {
  it("normalises case and spaces", () => {
    expect(emailSchema.parse("  Fan@Example.COM ")).toBe("fan@example.com");
  });
  it("rejects malformed addresses", () => {
    for (const bad of ["", "fan", "fan@", "fan@example", "a b@example.com"]) {
      expect(emailSchema.safeParse(bad).success).toBe(false);
    }
  });
});

describe("passwordSchema", () => {
  it("accepts 8+ characters with a letter and a number", () => {
    expect(passwordSchema.safeParse("afrobeat9").success).toBe(true);
  });
  it("rejects short, letters only or numbers only", () => {
    for (const bad of ["abc12", "onlyletters", "1234567890"]) {
      expect(passwordSchema.safeParse(bad).success).toBe(false);
    }
  });
  it("rejects passwords longer than 72 characters", () => {
    expect(passwordSchema.safeParse("a1" + "x".repeat(71)).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("returns the first problem as a readable message", () => {
    const r = signUpSchema.safeParse({ email: "fan@example.com", password: "short1" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Use at least 8 characters.");
  });
});
