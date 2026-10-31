/** URL friendly version of a name: "Burna Boy" becomes "burna-boy". */
export function slugify(input: string, max = 80): string {
  const s = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return s || "untitled";
}

export function withSuffix(slug: string, n: number, max = 80) {
  const tail = `-${n}`;
  return slug.slice(0, max - tail.length).replace(/-+$/g, "") + tail;
}

/** Colour scheme for generated artwork, stable for a given slug. */
export function artVariant(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 5;
}
