import { describe, expect, it } from "vitest";
import { cleanPlatformUrl, orderedLinks } from "@/features/catalogue/platforms";
import { artVariant, slugify, withSuffix } from "@/features/catalogue/slug";
import { formatDuration, parseDuration, releaseYear } from "@/features/catalogue/format";
import { artistSchema, readLinks, trackSchema } from "@/features/catalogue/schema";

describe("cleanPlatformUrl", () => {
  it("keeps https links on the right platform", () => {
    expect(cleanPlatformUrl("spotify", "https://open.spotify.com/track/abc#x")).toBe("https://open.spotify.com/track/abc");
    expect(cleanPlatformUrl("youtube", "https://youtu.be/abc")).toBe("https://youtu.be/abc");
  });
  it("rejects other hosts, http and junk", () => {
    expect(cleanPlatformUrl("spotify", "https://evil.example/open.spotify.com")).toBeNull();
    expect(cleanPlatformUrl("spotify", "http://open.spotify.com/track/abc")).toBeNull();
    expect(cleanPlatformUrl("spotify", "javascript:alert(1)")).toBeNull();
    expect(cleanPlatformUrl("audiomack", "not a url")).toBeNull();
  });
  it("orders links the same way everywhere and ignores unknown keys", () => {
    const out = orderedLinks({ youtube: "https://youtu.be/a", spotify: "https://open.spotify.com/a", myspace: "x" });
    expect(out.map((l) => l.key)).toEqual(["spotify", "youtube"]);
  });
});

describe("readLinks", () => {
  it("collects good links and reports bad ones by field", () => {
    const form = new FormData();
    form.set("link_spotify", "https://open.spotify.com/artist/1");
    form.set("link_deezer", "https://example.com/x");
    form.set("link_tidal", "");
    const { links, errors } = readLinks(form);
    expect(links).toEqual({ spotify: "https://open.spotify.com/artist/1" });
    expect(Object.keys(errors)).toEqual(["link_deezer"]);
  });
});

describe("slugs", () => {
  it("builds clean page addresses", () => {
    expect(slugify("Burna Boy")).toBe("burna-boy");
    expect(slugify("Tems & Wizkid: Essence!")).toBe("tems-and-wizkid-essence");
    expect(slugify("Fèla Kútì")).toBe("fela-kuti");
    expect(slugify("???")).toBe("untitled");
  });
  it("adds numbers without breaking the length limit", () => {
    expect(withSuffix("burna-boy", 2)).toBe("burna-boy-2");
    expect(withSuffix("a".repeat(80), 12, 80)).toHaveLength(80);
  });
  it("gives each slug a stable artwork variant", () => {
    expect(artVariant("burna-boy")).toBe(artVariant("burna-boy"));
    expect(artVariant("x")).toBeGreaterThanOrEqual(0);
    expect(artVariant("x")).toBeLessThan(5);
  });
});

describe("durations and dates", () => {
  it("parses and formats song lengths", () => {
    expect(parseDuration("3:45")).toBe(225);
    expect(parseDuration("225")).toBe(225);
    expect(parseDuration("")).toBeNull();
    expect(Number.isNaN(parseDuration("3:75"))).toBe(true);
    expect(formatDuration(225)).toBe("3:45");
    expect(formatDuration(null)).toBe("");
  });
  it("reads the year", () => {
    expect(releaseYear("2024-03-01")).toBe("2024");
  });
});

describe("artistSchema", () => {
  it("splits, trims and de-duplicates genres", () => {
    const r = artistSchema.parse({ name: " Asa ", slug: "", country_code: "ng", genres: "Soul, Afro pop, soul, Soul", summary: "", is_published: true });
    expect(r).toMatchObject({ name: "Asa", slug: null, country_code: "NG", genres: ["Soul", "Afro pop", "soul"], summary: null });
  });
  it("caps genres at 6", () => {
    expect(artistSchema.safeParse({ name: "X", slug: "", country_code: "", genres: "a,b,c,d,e,f,g", summary: "", is_published: true }).success).toBe(false);
  });
});

describe("trackSchema", () => {
  const base = {
    title: "Song",
    slug: "",
    artist_id: "11111111-1111-4111-8111-111111111111",
    release_id: "",
    track_number: "",
    isrc: "",
    duration: "",
    release_date: "",
    featured_ids: [],
    is_published: true,
  };
  it("normalises ISRC and duration", () => {
    const r = trackSchema.parse({ ...base, isrc: "ng-a1b-2600001", duration: "3:05", track_number: "7" });
    expect(r.isrc).toBe("NGA1B2600001");
    expect(r.duration).toBe(185);
    expect(r.track_number).toBe(7);
    expect(r.release_id).toBeNull();
  });
  it("rejects a bad ISRC, a silly length and an invalid artist id", () => {
    expect(trackSchema.safeParse({ ...base, isrc: "ABC" }).success).toBe(false);
    expect(trackSchema.safeParse({ ...base, duration: "99:99" }).success).toBe(false);
    expect(trackSchema.safeParse({ ...base, artist_id: "nope" }).success).toBe(false);
  });
});
