"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { ImagePicker } from "@/components/ui/image-picker";
import { updateProfile } from "@/features/auth/actions";
import type { SessionUser } from "@/features/auth/session";
import { roleLabels } from "@/lib/config";
import type { ActionState } from "@/types";

/** Name / email / avatar of the signed-in admin. */
export function ProfileForm({ user }: { user: SessionUser }) {
  // Controlled fields: React resets uncontrolled forms after a server action, which
  // would flash the previous values before the refreshed session arrives.
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateProfile, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <Card className="flex w-full flex-col gap-5 p-6">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle size="lg">Profile Details</CardTitle>
          <span className="rounded-xs bg-page px-2 py-0.5 font-sans text-11 font-semibold leading-native text-body">
            {roleLabels[user.role] ?? user.role}
          </span>
        </div>
        <div className="flex w-full flex-col gap-2">
          <span className="font-sans text-13 font-bold leading-native text-body">Profile Photo</span>
          <ImagePicker name="avatarUrl" value={avatarUrl} onChange={setAvatarUrl} shape="square" label="Click to upload photo" hint="Square PNG, JPG or WEBP up to 5MB" />
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <Field label="Full Name *" htmlFor="profile-name" error={errors.name}>
            <Input id="profile-name" name="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email Address *" htmlFor="profile-email" error={errors.email} hint="Used to sign in and to receive password-reset emails.">
            <Input id="profile-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <FormStatus message={state?.ok ? state.message : undefined} error={state?.error} />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
