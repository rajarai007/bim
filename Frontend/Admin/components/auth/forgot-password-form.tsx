"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, type ForgotPasswordState } from "@/features/auth/actions";
import { routes } from "@/lib/constants";

const control =
  "w-full rounded-md border border-line bg-page p-3 font-sans text-14 leading-native text-ink placeholder:text-body transition-colors focus:border-primary focus-visible:outline-none";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(requestPasswordReset, undefined);

  if (state?.ok) {
    return (
      <div className="flex w-full flex-col items-center gap-5 text-center">
        <p role="status" className="w-full rounded-sm bg-success-soft px-3 py-3 font-sans text-13 leading-[18px] text-success">
          If an account exists for <strong>{state.email}</strong>, we&apos;ve emailed a password reset link. It expires in 60 minutes.
        </p>
        <Link href={routes.login} className="font-sans text-13 font-semibold leading-native text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="email" className="font-sans text-13 font-bold leading-native text-body">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="you@bimcareeracademy.com"
          defaultValue={state?.email ?? ""}
          className={control}
        />
      </div>
      {state?.error ? (
        <p role="alert" className="w-full rounded-sm bg-danger-tint px-3 py-2 font-sans text-13 leading-native text-danger">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" fullWidth disabled={pending} className="rounded-md py-3.5 text-15">
        {pending ? "Sending…" : "Send Reset Link"}
      </Button>
      <Link href={routes.login} className="w-full text-center font-sans text-13 font-semibold leading-native text-primary hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}
