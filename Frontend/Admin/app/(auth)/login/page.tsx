import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Admin Panel Login" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  return (
    <AuthShell title="Admin Panel Login" subtitle="Secure access for BIM Academy operations">
      {reason === "expired" ? (
        <p role="status" className="w-full rounded-sm bg-warning-soft px-3 py-2 text-center font-sans text-13 leading-native text-warning">
          Your session has expired. Please sign in again.
        </p>
      ) : null}
      <LoginForm />
    </AuthShell>
  );
}
