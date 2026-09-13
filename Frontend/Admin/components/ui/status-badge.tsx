import type { CourseStatus, LeadStatus, Tone } from "@/types";
import { cn } from "@/lib/utils";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  teal: "bg-teal-soft text-teal",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  muted: "bg-page text-muted",
};

export function StatusBadge({
  tone,
  size = "md",
  className,
  children,
}: {
  tone: Tone;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-start rounded-pill px-2.5 py-1 font-sans font-bold leading-native whitespace-nowrap",
        size === "md" ? "text-12" : "text-11",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const leadStatusMeta: Record<LeadStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "info" },
  contacted: { label: "Contacted", tone: "teal" },
  "follow-up": { label: "Follow-up", tone: "warning" },
  converted: { label: "Converted", tone: "success" },
  lost: { label: "Lost", tone: "danger" },
};

export const courseStatusMeta: Record<CourseStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  draft: { label: "Draft", tone: "warning" },
  inactive: { label: "Inactive", tone: "muted" },
};

/** 8px coloured dot used on stat cards. */
export function Dot({ tone }: { tone: Tone }) {
  const colors: Record<Tone, string> = {
    primary: "bg-primary",
    teal: "bg-teal",
    success: "bg-success",
    info: "bg-info",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-muted",
  };
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-pill", colors[tone])} />;
}
