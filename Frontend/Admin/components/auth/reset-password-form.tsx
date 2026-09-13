"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPassword, type ResetPasswordState } from "@/features/auth/actions";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-md border border-line bg-page p-3 font-sans text-14 leading-native text-ink placeholder:text-body transition-colors focus:border-primary focus-visible:outline-none";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(resetPassword.bind(null, token), undefined);
  const [show, setShow] = useState(false);
  const errors = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div className="flex w-full flex-col items-center gap-5 text-center">
        <p role="status" className="w-full rounded-sm bg-success-soft px-3 py-3 font-sans text-13 leading-[18px] text-success">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Button href={routes.login} fullWidth className="rounded-md py-3.5 text-15">
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col items-start gap-5">
      {(["password", "confirmPassword"] as const).map((field) => (
        <div key={field} className="flex w-full flex-col gap-2">
          <label htmlFor={field} className="font-sans text-13 font-bold leading-native text-body">
            {field === "password" ? "New Password" : "Confirm New Password"}
          </label>
          <div className="relative w-full">
            <input
              id={field}
              name={field}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className={cn(control, "pr-10")}
            />
            {field === "password" ? (
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-body"
              >
                {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            ) : null}
          </div>
          {errors[field] ? (
            <p role="alert" className="font-sans text-12 leading-native text-danger">
              {errors[field]}
            </p>
          ) : null}
        </div>
      ))}
      {state?.error && !Object.keys(errors).length ? (
        <p role="alert" className="w-full rounded-sm bg-danger-tint px-3 py-2 font-sans text-13 leading-native text-danger">
          {state.error}{" "}
          <Link href={routes.forgotPassword} className="font-semibold underline">
            Request a new link
          </Link>
        </p>
      ) : null}
      <Button type="submit" fullWidth disabled={pending} className="rounded-md py-3.5 text-15">
        {pending ? "Resetting…" : "Reset Password"}
      </Button>
    </form>
  );
}
