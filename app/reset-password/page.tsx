import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getViewer } from "@/lib/supabase/server";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const { userId } = await getViewer();
  if (!userId) redirect("/forgot-password");
  return (
    <AuthShell title="Choose a new password">
      <ResetPasswordForm />
    </AuthShell>
  );
}
