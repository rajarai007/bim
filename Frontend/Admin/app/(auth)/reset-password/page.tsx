import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { routes } from "@/lib/constants";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const raw = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = raw && /^[a-f0-9]{64}$/.test(raw) ? raw : null;

  return (
    <AuthShell title="Choose a New Password" subtitle="Secure access for BIM Academy operations">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex w-full flex-col items-center gap-5 text-center">
          <p role="alert" className="w-full rounded-sm bg-danger-tint px-3 py-3 font-sans text-13 leading-[18px] text-danger">
            This password reset link is invalid. Please request a new one.
          </p>
          <Link href={routes.forgotPassword} className="font-sans text-13 font-semibold leading-native text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
