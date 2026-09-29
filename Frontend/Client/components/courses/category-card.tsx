import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/courses/category-icon";
import { routes } from "@/lib/constants";
import type { Category } from "@/types";

/** Home "Specialized Training Divisions" card. */
export function CategoryCard({ category }: { category: Category }) {
  const href = routes.category(category.slug);
  return (
    <article
      data-spotlight="accent"
      data-tilt
      className="card-lift group relative flex h-full flex-col items-start gap-5 rounded-lg bg-surface/80 p-8 hover:border-accent/40"
    >
      {/* Drafting grid surfaces behind the content on hover. */}
      <span aria-hidden className="blueprint-bg pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 ease-brand group-hover:opacity-100" />
      <span className="well relative size-12 group-hover:-translate-y-1" data-tone="accent">
        <CategoryIcon icon={category.icon} className="size-6 transition-transform duration-400 ease-brand group-hover:rotate-6" />
      </span>
      <h3 className="pop relative w-full font-heading text-20 font-semibold leading-native text-heading [--pop:16px]">
        <Link href={href} className="transition-colors hover:text-accent">
          {category.name}
        </Link>
      </h3>
      <p className="relative w-full font-sans text-14 leading-normal text-muted">{category.summary}</p>
      <Link
        href={href}
        className="group/link relative mt-auto flex items-center gap-1 font-sans text-13 font-semibold leading-native text-primary-bright transition-colors hover:text-heading"
      >
        Explore Domain
        <ChevronRight
          className="size-3 transition-transform duration-300 ease-brand group-hover/link:translate-x-1"
          aria-hidden
        />
      </Link>
    </article>
  );
}
