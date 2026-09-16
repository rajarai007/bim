"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Submit handler for forms driven by `useActionState`.
 *
 * React resets a `<form action={…}>` after the action settles, which wipes
 * every uncontrolled field even when the server answered with a validation
 * error. Dispatching the action ourselves keeps what the admin typed so they
 * can correct the highlighted field instead of starting over. Native
 * constraint validation (`required`, `min`, …) still runs before `submit`.
 */
export function useActionSubmit(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}
