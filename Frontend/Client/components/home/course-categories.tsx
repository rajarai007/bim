import { CategoryCard } from "@/components/courses/category-card";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Category } from "@/types";

export function CourseCategories({ categories }: { categories: Category[] }) {
  return (
    <Section tone="surface" containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading badge="Curriculum Domains" title="Specialized Training Divisions" align="center" />
      <div data-reveal-stagger="scale" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Section>
  );
}
