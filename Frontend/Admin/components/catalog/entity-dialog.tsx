"use client";

import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormStatus } from "@/components/ui/form-status";
import { useActionSubmit } from "@/components/ui/use-action-submit";
import { saveCatalogItem, type CatalogEntity } from "@/features/catalog/actions";
import type { ActionState } from "@/types";

export type FieldErrors = Record<string, string>;

/**
 * Create/edit dialog shared by the catalogue screens. The body renders the
 * entity-specific fields and receives the API's field errors.
 */
export function EntityDialog({
  entity,
  id,
  title,
  open,
  onClose,
  onSaved,
  size,
  children,
}: {
  entity: CatalogEntity;
  id: number | null;
  title: string;
  open: boolean;
  onClose: () => void;
  onSaved: (message?: string) => void;
  size?: "md" | "lg";
  children: (errors: FieldErrors) => ReactNode;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await saveCatalogItem(entity, id, prev, formData);
    if (result?.ok) onSaved(result.message);
    return result;
  }, undefined);
  const submit = useActionSubmit(formAction);

  return (
    <Dialog open={open} title={title} onClose={onClose} size={size}>
      <form onSubmit={submit} className="flex w-full flex-col gap-4">
        {children(state?.fieldErrors ?? {})}
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <FormStatus error={state?.error} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : id ? "Save Changes" : "Create"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

/** Label + switch row used inside dialogs (submits "on" when checked). */
export function ToggleRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-sm border border-line bg-page px-4 py-3">
      <span className="flex flex-col gap-0.5 leading-native">
        <span className="font-sans text-14 font-bold text-ink">{label}</span>
        {hint ? <span className="font-sans text-11 text-muted">{hint}</span> : null}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-primary" />
    </label>
  );
}
