"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { changePassword } from "@/features/auth/actions";
import type { ActionState } from "@/types";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(changePassword, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <Card className="flex w-full flex-col gap-5 p-6">
        <div className="flex flex-col gap-1">
          <CardTitle size="lg">Change Password</CardTitle>
          <p className="font-sans text-12 leading-native text-muted">Use at least 8 characters. You stay signed in on this device.</p>
        </div>
        <Field label="Current Password *" htmlFor="currentPassword" error={errors.currentPassword}>
          <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
        </Field>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <Field label="New Password *" htmlFor="newPassword" error={errors.newPassword}>
            <Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
          </Field>
          <Field label="Confirm New Password *" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <FormStatus message={state?.ok ? state.message : undefined} error={state?.error} />
          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
