import { FeaturedCourseCard } from "@/components/courses/course-card";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { routes } from "@/lib/constants";
import type { Course } from "@/types";

export function FeaturedCourses({ courses }: { courses: Course[] }) {
  return (
    <Section padding="lg" containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading
        badge="Popular Training Programs"
        badgeTone="primary"
        title="Featured Architectural Engineering Courses"
      />
      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
