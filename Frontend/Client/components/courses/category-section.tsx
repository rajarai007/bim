import Link from "next/link";
import { ChevronWide } from "@/components/icons/chevron-wide";
import { CompactCourseCard } from "@/components/courses/course-card";
import { Section } from "@/components/layout/section";
import { routes } from "@/lib/constants";
import type { Category, Course } from "@/types";

/** One category block on the Courses overview page. */
export function CategorySection({
  category,
  courses,
  viewAllLabel,
}: {
  category: Category;
  courses: Course[];
  viewAllLabel: string;
}) {
  return (
    <Section containerClassName="flex flex-col gap-8">
      <div data-reveal-stagger="up" className="flex w-full flex-col items-start gap-2 leading-native">
        <h2 className="font-heading text-24 font-extrabold text-heading md:text-28 xl:text-32">
          {category.overviewTitle}
        </h2>
        <p className="font-sans text-16 text-muted">{category.tagline}</p>
      </div>
      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {courses.map((course) => (
          <CompactCourseCard
            key={course.slug}
            href={routes.course(category.slug, course.slug)}
            title={course.title}
            description={course.description}
            image={course.image}
          />
        ))}
      </div>
      <Link
        href={routes.category(category.slug)}
        data-reveal="up"
        className="group/link flex items-center gap-2 font-sans text-15 font-bold leading-native text-primary transition-colors hover:text-[#ff6b36]"
      >
        {viewAllLabel}
        <ChevronWide
          size={12}
          className="transition-transform duration-300 ease-brand group-hover/link:translate-x-1"
        />
      </Link>
    </Section>
  );
}
