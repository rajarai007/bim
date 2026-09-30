"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
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
        className="-mx-5 flex gap-3 overflow-x-auto px-5 pt-10 md:mx-0 md:justify-center md:overflow-visible md:px-0 xl:pt-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [--stagger-step:60ms]"
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
                "shrink-0 rounded-pill border px-5 py-2.5 font-sans text-14 font-semibold leading-native shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-[background-color,border-color,color,translate,scale,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:duration-100",
                selected
                  ? "btn-primary border-transparent text-white"
                  : "border-line bg-heading/4 text-body hover:border-line-strong hover:bg-heading/8 hover:text-heading",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        data-reveal-stagger="flip"
        className="grid grid-cols-1 gap-6 pt-10 pb-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:pt-14 xl:pb-24"
      >
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {visible.length === 0 ? (
          <div className="state-panel col-span-full">
            <span className="well well-round size-12" data-tone="muted" aria-hidden>
              <FolderOpen className="size-5" />
            </span>
            <p className="font-sans text-15 leading-body text-muted">No projects in this category yet.</p>
          </div>
        ) : null}
      </div>
    </>
  );
}
