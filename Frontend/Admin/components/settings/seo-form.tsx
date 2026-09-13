"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { savePageMeta } from "@/features/settings/actions";
import type { ActionState, SitePage } from "@/types";

export function SeoForm({ pages }: { pages: SitePage[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(savePageMeta, undefined);
  const errors = state?.fieldErrors ?? {};
  const [lengths, setLengths] = useState<Record<string, number>>(() =>
    Object.fromEntries(pages.flatMap((p) => [[`${p.id}-title`, p.metaTitle?.length ?? 0], [`${p.id}-description`, p.metaDescription?.length ?? 0]])),
  );
  const track = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setLengths((l) => ({ ...l, [key]: e.target.value.length }));

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <div className="flex w-full items-center justify-between gap-4">
        <p className="font-sans text-13 leading-native text-muted">
          Meta titles and descriptions for each public page. Keep titles under 60 characters.
        </p>
        <div className="flex items-center gap-3">
          <FormStatus message={state?.ok ? state.message : undefined} error={state?.error} />
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {pages.map((p) => (
          <Card key={p.id} id={`page-${p.id}`} className="flex flex-col gap-4 p-6">
            <input type="hidden" name="pageId" value={p.id} />
            <div className="flex items-baseline justify-between gap-3">
              <CardTitle>{p.title}</CardTitle>
              <span className="font-sans text-12 leading-native text-muted">{p.path}</span>
            </div>
            <Field label="Meta Title" htmlFor={`seo-${p.id}-title`} hint={`${lengths[`${p.id}-title`] ?? 0} / 60 characters`} error={errors[`${p.id}-metaTitle`]}>
              <Input id={`seo-${p.id}-title`} name={`${p.id}-title`} defaultValue={p.metaTitle ?? ""} maxLength={160} onChange={track(`${p.id}-title`)} />
            </Field>
            <Field label="Meta Description" htmlFor={`seo-${p.id}-description`} hint={`${lengths[`${p.id}-description`] ?? 0} / 160 characters`} error={errors[`${p.id}-metaDescription`]}>
              <Textarea id={`seo-${p.id}-description`} name={`${p.id}-description`} defaultValue={p.metaDescription ?? ""} maxLength={320} className="min-h-[80px]" onChange={track(`${p.id}-description`)} />
            </Field>
          </Card>
        ))}
        {pages.length === 0 ? (
          <Card className="p-10 text-center font-sans text-14 text-muted xl:col-span-2">No pages configured.</Card>
        ) : null}
      </div>
    </form>
  );
}
