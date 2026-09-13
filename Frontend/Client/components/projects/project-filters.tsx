"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import type { Category, Project } from "@/types";
import { cn } from "@/lib/utils";

/** Filter pills + filtered grid for the Projects page. */
export function ProjectFilters({ projects, categories }: { projects: Project[]; categories: Category[] }) {
  const [active, setActive] = useState<string>("all");
  const projectFilters = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.slug, label: c.badge })),
  ];
  const visible =
    active === "all" ? projects : projects.filter((p) => p.category.slug === active);

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter projects by category"
        data-reveal-stagger="scale"
        className="-mx-5 flex gap-3 overflow-x-auto px-5 pt-8 md:mx-0 md:justify-center md:overflow-visible md:px-0 xl:pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [--stagger-step:60ms]"
      >
        {projectFilters.map((filter) => {
          const selected = filter.id === active;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(filter.id)}
              className={cn(
                "shrink-0 rounded-[40px] border border-line px-5 py-2.5 font-sans text-14 font-bold leading-native text-white transition-[background-color,border-color,translate,scale,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:duration-100",
                selected
                  ? "border-primary bg-primary shadow-[0_10px_24px_-10px_rgb(255_90_31/0.7)]"
                  : "bg-surface hover:border-primary/40 hover:bg-elevated",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        data-reveal-stagger="up"
        className="grid grid-cols-1 gap-6 pt-8 pb-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:pt-10 xl:pb-20"
      >
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {visible.length === 0 ? (
          <p className="col-span-full py-10 text-center font-sans text-15 leading-body text-muted">
            No projects in this category yet.
          </p>
        ) : null}
      </div>
    </>
  );
}
