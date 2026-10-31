import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" intro="Enter your email and we'll send you a link to choose a new password.">
      <ForgotPasswordForm />
      <p className="mt-6 text-sm text-mist">
        Remembered it?{" "}
        <Link href="/signin" className="text-paper underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
