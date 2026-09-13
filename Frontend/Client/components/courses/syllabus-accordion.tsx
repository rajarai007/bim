"use client";

import { useId, useState } from "react";
import { ChevronDownWide } from "@/components/icons/chevron-down-wide";
import type { SyllabusModule } from "@/types";
import { cn } from "@/lib/utils";

/** Syllabus modules — all expanded by default (as designed), collapsible. */
export function SyllabusAccordion({ modules }: { modules: SyllabusModule[] }) {
  const baseId = useId();
  const [closed, setClosed] = useState<Set<number>>(() => new Set());

  const toggle = (i: number) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div data-reveal-stagger="up" className="flex w-full flex-col gap-3 [--stagger-step:60ms]">
      {modules.map((module, i) => {
        const open = !closed.has(i);
        const panelId = `${baseId}-${i}`;
        return (
          <div
            key={module.title}
            className={cn(
              "flex w-full flex-col rounded-sm border border-line bg-surface p-5 transition-[border-color,gap] duration-300 ease-brand hover:border-accent/40",
              open ? "gap-2.5" : "gap-0",
            )}
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="group flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="flex-1 font-heading text-16 font-extrabold leading-native text-white transition-colors duration-200 group-hover:text-accent">
                  {module.title}
                </span>
                <ChevronDownWide
                  size={16}
                  className={cn(
                    "text-accent transition-transform duration-300 ease-brand",
                    !open && "-rotate-90",
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              inert={!open}
              aria-hidden={!open}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-brand",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <p
                className={cn(
                  "overflow-hidden font-sans text-14 leading-normal text-muted transition-[opacity,translate] duration-300 ease-brand",
                  open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                )}
              >
                {module.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
