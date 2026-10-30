"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string; email?: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendSignInLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { status: "error", message: "That email address doesn't look right." };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });

  if (error) {
    console.error("signInWithOtp failed", error.message);
    const busy = error.status === 429;
    return {
      status: "error",
      message: busy ? "Too many attempts. Please wait a minute and try again." : "We couldn't send the link. Please try again.",
    };
  }
  return { status: "sent", email };
}
