"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "@/features/auth/actions";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const control =
    "w-full rounded-md border border-line bg-page p-3 font-sans text-14 leading-native text-ink placeholder:text-body transition-colors focus:border-primary focus-visible:outline-none";

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
          placeholder="admin@bimcareeracademy.com"
          defaultValue={state?.email ?? ""}
          className={control}
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="password" className="font-sans text-13 font-bold leading-native text-body">
          Password
        </label>
        <div className="relative w-full">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••••••"
            className={cn(control, "pr-10 tracking-[0.15em] placeholder:tracking-[0.15em]")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-body"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <span className="relative flex size-[18px] items-center justify-center">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer size-[18px] cursor-pointer appearance-none rounded-xs border border-line bg-page transition-colors checked:border-primary checked:bg-primary"
            />
            <Check
              aria-hidden
              strokeWidth={3}
              className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100"
            />
          </span>
          <span className="font-sans text-13 font-medium leading-native text-body">Remember Me</span>
        </label>
        <Link href={routes.forgotPassword} className="font-sans text-13 font-semibold leading-native text-primary hover:underline">
          Forgot Password?
        </Link>
      </div>

      {state?.error ? (
        <p role="alert" className="w-full rounded-sm bg-danger-tint px-3 py-2 font-sans text-13 leading-native text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={pending} className="rounded-md py-3.5 text-15">
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
