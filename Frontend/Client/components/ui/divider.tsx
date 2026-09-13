import { cn } from "@/lib/utils";

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("w-full border-0 border-t border-line", className)} />;
}
