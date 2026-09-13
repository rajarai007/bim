import { cn } from "@/lib/utils";

/** Inline success / error line used next to form submit buttons. */
export function FormStatus({ message, error, className }: { message?: string; error?: string; className?: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn("font-sans text-13 leading-native empty:hidden", error ? "text-danger" : "text-success", className)}
    >
      {error ?? message ?? null}
    </p>
  );
}
