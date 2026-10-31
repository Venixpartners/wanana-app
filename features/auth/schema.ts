import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "That email address is too long.")
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "That email address doesn't look right.");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.")
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Use at least one letter and one number.");

export const signInSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.") });
export const signUpSchema = z.object({ email: emailSchema, password: passwordSchema });
export const emailOnlySchema = z.object({ email: emailSchema });
export const newPasswordSchema = z.object({ password: passwordSchema });

export const googleSignInEnabled = () => process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "on";
