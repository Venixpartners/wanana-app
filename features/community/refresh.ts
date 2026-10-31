import { revalidatePath } from "next/cache";
import { safeNextPath } from "@/lib/safe-redirect";

/** Re-renders the page the form was posted from (hidden "back" field). */
export function refreshFrom(form: FormData, fallback = "/") {
  const back = safeNextPath(String(form.get("back") ?? ""), fallback).split("?")[0];
  revalidatePath(back);
  return back;
}
