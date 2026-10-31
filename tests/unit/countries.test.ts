import { describe, expect, it } from "vitest";
import { countryName, isCountryCode, priorityCountries } from "@/lib/countries";

describe("countries", () => {
  it("lists Nigeria first", () => {
    expect(priorityCountries[0]).toEqual({ code: "NG", name: "Nigeria" });
  });
  it("uses plain names", () => {
    expect(countryName("CD")).toBe("DR Congo");
    expect(countryName("GB")).toBe("United Kingdom");
  });
  it("knows real codes only", () => {
    expect(isCountryCode("NG")).toBe(true);
    expect(isCountryCode("XX")).toBe(false);
  });
});
