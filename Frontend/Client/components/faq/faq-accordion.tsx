"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types";
import { cn } from "@/lib/utils";

type Tone = "elevated" | "surface";

const tones: Record<Tone, string> = {
  elevated: "glass",
  surface: "glass-strong",
};

/**
 * Accessible accordion. Items with `defaultOpen` start expanded; when
 * `allOpen` is set every item starts expanded (home-page preview).
 */
export function FaqAccordion({
  items,
  tone = "surface",
  allOpen = false,
  answerLeading = "body",
  className,
}: {
  items: FaqItem[];
  tone?: Tone;
  allOpen?: boolean;
  answerLeading?: "body" | "normal";
  className?: string;
}) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<number>>(
    () => new Set(items.filter((i) => allOpen || i.defaultOpen).map((i) => i.id)),
  );

  const toggle = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div data-reveal-stagger="up" className={cn("flex w-full flex-col gap-4", className)}>
      {items.map((item) => {
        const open = openIds.has(item.id);
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;
        return (
          <div
            key={item.id}
            className={cn(
              "glass-edge flex w-full flex-col rounded-md p-6 transition-[border-color,gap,box-shadow] duration-300 ease-brand hover:border-accent/40 hover:shadow-[var(--shadow-sheet-lifted)]",
              tones[tone],
              open ? "gap-3 border-accent/30" : "gap-0",
            )}
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="group flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="flex-1 font-heading text-16 font-bold leading-native text-heading transition-colors duration-200 group-hover:text-accent">
                  {item.question}
                </span>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full transition-[background-color,rotate] duration-300 ease-brand group-hover:bg-accent-soft",
                    open && "rotate-180 bg-accent-soft",
                  )}
                >
                  <ChevronDown aria-hidden className="size-4 text-accent" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              aria-hidden={!open}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-brand",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <p
                className={cn(
                  "overflow-hidden font-sans text-14 text-muted transition-[opacity,translate] duration-300 ease-brand",
                  open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                  answerLeading === "body" ? "leading-body" : "leading-normal",
                )}
              >
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
