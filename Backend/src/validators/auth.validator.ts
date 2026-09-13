import { z } from "zod";
import { optionalUrl, requiredText } from "./common";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

const newPassword = z
  .string({ message: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(200, "Password must be at most 200 characters");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(200),
  remember: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: requiredText("Name", 120, 2),
  email,
  avatarUrl: optionalUrl(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(200),
  newPassword,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().trim().regex(/^[a-f0-9]{64}$/, "Invalid reset token"),
  password: newPassword,
});
