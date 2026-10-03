import { FeaturedCourseCard } from "@/components/courses/course-card";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

export function FeaturedCourses({ courses }: { courses: Course[] }) {
  return (
    <Section padding="lg" tilt containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading
        badge="Popular Training Programs"
        badgeTone="primary"
        title="Featured BIM Courses in Delhi"
      />
      {/* Four courses fill one row on wide screens instead of leaving one orphaned under three. */}
      <div
        data-reveal-stagger="flip"
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8",
          courses.length === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {courses.map((course) => (
          <FeaturedCourseCard
            key={course.slug}
            href={routes.course(course.category.slug, course.slug)}
            title={course.title}
            badge={course.badge}
            description={course.description}
            image={course.image}
            meta={{ kind: "text", label: "Offline & Online Classes" }}
          />
        ))}
      </div>
    </Section>
  );
}
