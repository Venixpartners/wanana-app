"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/origin";
import { emailOnlySchema, googleSignInEnabled, newPasswordSchema, signInSchema, signUpSchema } from "./schema";

export type AuthState = {
  status: "idle" | "error" | "sent";
  message?: string;
  email?: string;
};

const BUSY = "Too many attempts. Please wait a minute and try again.";

function read(form: FormData, key: string) {
  return String(form.get(key) ?? "");
}

/** Email and password sign in. The same form can ask for an emailed link instead. */
export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (form.get("intent") === "link") return sendLink(read(form, "email"));

  const parsed = signInSchema.safeParse({ email: read(form, "email"), password: read(form, "password") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, email: read(form, "email") };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.status === 429) return { status: "error", message: BUSY, email: parsed.data.email };
    if (error.code === "email_not_confirmed") {
      const origin = await requestOrigin();
      await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: `${origin}/auth/callback` } });
      return { status: "error", message: "Confirm your email first. We've sent you a fresh confirmation link.", email: parsed.data.email };
    }
    return { status: "error", message: "That email and password don't match. Try again or reset your password.", email: parsed.data.email };
  }
  redirect("/onboarding");
}

async function sendLink(rawEmail: string): Promise<AuthState> {
  const parsed = emailOnlySchema.safeParse({ email: rawEmail });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, email: rawEmail };

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });
  if (error) {
    console.error("signInWithOtp failed", error.message);
    return { status: "error", message: error.status === 429 ? BUSY : "We couldn't send the link. Please try again.", email: parsed.data.email };
  }
  return { status: "sent", email: parsed.data.email };
}

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({ email: read(form, "email"), password: read(form, "password") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, email: read(form, "email") };

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    if (error.status === 429) return { status: "error", message: BUSY, email: parsed.data.email };
    if (error.code === "weak_password") return { status: "error", message: "Choose a stronger password.", email: parsed.data.email };
    console.error("signUp failed", error.code, error.message);
    return { status: "error", message: "We couldn't create your account. Please try again.", email: parsed.data.email };
  }
  // With email confirmation on there is no session yet: the person confirms from their inbox.
  if (data.session) redirect("/onboarding");
  return { status: "sent", email: parsed.data.email };
}

export async function requestPasswordResetAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = emailOnlySchema.safeParse({ email: read(form, "email") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, email: read(form, "email") };

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error?.status === 429) return { status: "error", message: BUSY, email: parsed.data.email };
  if (error) console.error("resetPasswordForEmail failed", error.message);
  // Same answer whether or not the account exists, so nobody can test which emails are registered.
  return { status: "sent", email: parsed.data.email };
}

export async function updatePasswordAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = newPasswordSchema.safeParse({ password: read(form, "password") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return { status: "error", message: "Your reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { status: "error", message: "Choose a password you haven't used here before." };
    return { status: "error", message: "We couldn't update your password. Please try again." };
  }
  redirect("/me?password=updated");
}

export async function googleSignInAction(): Promise<void> {
  if (!googleSignInEnabled()) redirect("/signin");
  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) redirect("/signin?error=google");
  redirect(data.url);
}
