"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import type { FaqCategory, FaqItem } from "@/types";
import { cn } from "@/lib/utils";

/**
 * FAQ page body: category sidebar (tabs) + accordion list.
 * "General Queries" shows every question, as in the design; other tabs filter.
 */
export function FaqBrowser({
  categories,
  faqs,
}: {
  categories: FaqCategory[];
  faqs: FaqItem[];
}) {
  const [active, setActive] = useState<string>(categories[0]?.slug ?? "general");
  const visible = active === "general" ? faqs : faqs.filter((f) => f.category.slug === active);

  return (
    <div className="flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-16">
      <div
        role="tablist"
        aria-label="FAQ categories"
        aria-orientation="vertical"
        data-reveal-stagger="left"
        className="-mx-5 flex w-[calc(100%+40px)] gap-3 overflow-x-auto px-5 lg:mx-0 lg:w-[280px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [--stagger-step:60ms]"
      >
        {categories.map((category) => {
          const selected = category.slug === active;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`faq-panel-${category.slug}`}
              onClick={() => setActive(category.slug)}
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-sm border p-4 text-left font-sans text-14 font-bold leading-native transition-[color,border-color,background-color,translate] duration-300 ease-brand active:scale-[0.98] lg:w-full lg:hover:translate-x-1",
                selected
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-surface text-body hover:border-primary/50",
              )}
            >
              <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{category.label}</span>
              <ChevronRight
                aria-hidden
                className={cn(
                  "size-3.5 shrink-0 transition-[color,translate] duration-300 ease-brand group-hover:translate-x-0.5",
                  selected ? "translate-x-0.5 text-primary" : "text-muted",
                )}
              />
            </button>
          );
        })}
      </div>
      <div
        id={`faq-panel-${active}`}
        role="tabpanel"
        className="flex w-full min-w-0 flex-1 flex-col"
      >
        {visible.length ? (
          <FaqAccordion key={active} items={visible} tone="surface" />
        ) : (
          <p className="py-10 text-center font-sans text-15 leading-body text-muted">
            No questions in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
