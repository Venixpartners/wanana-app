import { describe, expect, test } from "vitest";
import { isChart, movement, movementText, pulseWord, splitText } from "@/features/pulse/charts";
import { channelUrl, isShareCode, newShareCode, shareKindOf, storyCardPath, trackedUrl } from "@/features/share/links";

describe("chart helpers", () => {
  test("knows the four charts", () => {
    expect(["fan", "nigeria", "diaspora", "rising"].every(isChart)).toBe(true);
    expect(isChart("global")).toBe(false);
  });
  test("movement against this week's snapshot", () => {
    expect(movement(3, null)).toEqual({ kind: "new", by: 0 });
    expect(movement(2, 7)).toEqual({ kind: "up", by: 5 });
    expect(movement(9, 4)).toEqual({ kind: "down", by: 5 });
    expect(movementText(movement(4, 4))).toBe("No change");
    expect(movementText(movement(1, 3))).toBe("Up 2");
  });
  test("pulse words", () => {
    expect(pulseWord(null)).toBe("No scores yet");
    expect(pulseWord(90)).toBe("Fans love it");
    expect(pulseWord(70)).toBe("Warm");
    expect(pulseWord(40)).toBe("Cool");
  });
  test("home and diaspora split", () => {
    expect(splitText(null, 80)).toBeNull();
    expect(splitText(80, 81)).toMatch(/agree/);
    expect(splitText(85, 75)).toBe("Landing 10 points stronger at home than abroad.");
    expect(splitText(70, 78)).toBe("Landing 8 points stronger abroad than at home.");
  });
});

describe("share links", () => {
  test("works out what a path is about", () => {
    expect(shareKindOf("/song/ojuelegba")).toBe("song");
    expect(shareKindOf("/polls/123")).toBe("poll");
    expect(shareKindOf("/charts/fan")).toBe("chart");
    expect(shareKindOf("/u/detroyx")).toBe("profile");
    expect(shareKindOf("/admin")).toBeNull();
  });
  test("codes are ten lowercase letters or digits", () => {
    const code = newShareCode();
    expect(isShareCode(code)).toBe(true);
    expect(newShareCode(() => new Uint8Array(10).fill(0))).toBe("aaaaaaaaaa");
    expect(isShareCode("ABC")).toBe(false);
    expect(isShareCode("abc-def-gh")).toBe(false);
  });
  test("tracked links keep existing query strings", () => {
    expect(trackedUrl("https://wanana.africa", "/song/x", "abcdefghij")).toBe("https://wanana.africa/song/x?s=abcdefghij");
    expect(trackedUrl("https://wanana.africa", "/search?q=tems", "abcdefghij")).toBe("https://wanana.africa/search?q=tems&s=abcdefghij");
  });
  test("share intents", () => {
    expect(channelUrl("whatsapp", "https://w.a/s", "Hear this")).toBe("https://wa.me/?text=Hear%20this%20https%3A%2F%2Fw.a%2Fs");
    expect(channelUrl("x", "https://w.a/s", "Hi")).toBe("https://x.com/intent/post?text=Hi&url=https%3A%2F%2Fw.a%2Fs");
    expect(channelUrl("copy", "https://w.a/s", "Hi")).toBeNull();
  });
  test("story images exist for everything but profiles", () => {
    expect(storyCardPath("/song/x")).toBe("/card/song/x");
    expect(storyCardPath("/charts/fan?x=1")).toBe("/card/charts/fan");
    expect(storyCardPath("/u/detroyx")).toBeNull();
  });
});
