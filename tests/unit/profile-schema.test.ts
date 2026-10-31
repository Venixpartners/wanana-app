import { describe, expect, it } from "vitest";
import { avatarUrlPrefix, fieldErrors, handleSchema, profileSchema } from "@/features/profile/schema";

const valid = { handle: "Ayo_Fan", display_name: "Ayo", country_code: "ng", city: "", bio: "" };

describe("handleSchema", () => {
  it("lowercases and strips a leading @", () => {
    expect(handleSchema.parse("@Ayo_Fan")).toBe("ayo_fan");
  });
  it("rejects bad handles", () => {
    for (const bad of ["ab", "has space", "dash-ed", "x".repeat(21), "émoji"]) {
      expect(handleSchema.safeParse(bad).success).toBe(false);
    }
  });
});

describe("profileSchema", () => {
  it("normalises input and turns blanks into nulls", () => {
    expect(profileSchema.parse(valid)).toEqual({ handle: "ayo_fan", display_name: "Ayo", country_code: "NG", city: null, bio: null });
  });
  it("rejects unknown countries and long bios", () => {
    const r = profileSchema.safeParse({ ...valid, country_code: "XX", bio: "x".repeat(161) });
    expect(r.success).toBe(false);
    if (!r.success) {
      const f = fieldErrors(r.error.issues);
      expect(f.country_code).toBe("Choose your country.");
      expect(f.bio).toBe("Keep your bio to 160 characters.");
    }
  });
});

describe("avatarUrlPrefix", () => {
  it("points at the user's own folder", () => {
    expect(avatarUrlPrefix("https://x.supabase.co", "abc")).toBe("https://x.supabase.co/storage/v1/object/public/profile-photos/abc/");
  });
});
