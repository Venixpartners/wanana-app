/** Turns a database refusal into a sentence a fan can act on. */
export function writeError(error: { code?: string; message?: string } | null | undefined): string {
  if (!error) return "Something went wrong. Please try again.";
  if (error.message?.includes("rate_limited")) return "You're posting quickly. Wait a few minutes and try again.";
  if (error.code === "23505") return "You've already done that.";
  if (error.code === "42501" || error.message?.includes("row-level security")) return "You can't post this right now.";
  console.error("community write failed", error.code, error.message);
  return "Something went wrong. Please try again.";
}
