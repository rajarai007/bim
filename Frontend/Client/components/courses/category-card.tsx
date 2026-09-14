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
      className="card-lift group flex h-full flex-col items-start gap-5 rounded-md border border-line bg-elevated p-8 hover:border-accent/50"
    >
      <span className="flex size-12 items-center justify-center rounded-md bg-accent-soft text-accent transition-[scale,rotate,box-shadow] duration-400 ease-brand group-hover:-rotate-6 group-hover:scale-110 group-hover:shadow-[0_0_0_6px_rgb(0_245_212/0.1)]">
        <CategoryIcon icon={category.icon} className="size-6 transition-transform duration-400 ease-brand group-hover:rotate-6" />
      </span>
      <h3 className="w-full font-heading text-20 font-bold leading-native text-heading">
        <Link href={href} className="transition-colors hover:text-accent">
          {category.name}
        </Link>
      </h3>
      <p className="w-full font-sans text-14 leading-normal text-muted">{category.summary}</p>
      <Link
        href={href}
        className="group/link mt-auto flex items-center gap-1 font-sans text-13 font-bold leading-native text-primary transition-colors hover:text-[#ff6b36]"
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
