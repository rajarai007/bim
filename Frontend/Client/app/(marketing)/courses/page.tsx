import type { Metadata } from "next";
import { CategorySection } from "@/components/courses/category-section";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { getCategories, getCourses } from "@/features/courses/service";
import { getPageMetadata } from "@/features/pages/service";
import { routes } from "@/lib/constants";

const defaults = {
  title: "Courses",
  description: "Explore our comprehensive range of BIM, Structural, MEP & Interior Design training programs.",
};

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/courses", defaults);
}

/** Courses shown per category on the overview (the design shows up to five). */
const OVERVIEW_LIMIT = 5;

export default async function CoursesPage() {
  const [categories, courses] = await Promise.all([getCategories(), getCourses()]);
  const sections = categories
    .map((category) => ({
      category,
      courses: courses.filter((c) => c.category.slug === category.slug).slice(0, OVERVIEW_LIMIT),
    }))
    .filter((s) => s.courses.length > 0);

  return (
    <>
      <PageBanner
        title="Our Courses"
        description="Explore our comprehensive range of BIM, Structural, MEP & Interior Design training programs"
        glyph="wide"
        crumbs={[{ label: "Home", href: routes.home }, { label: "Courses" }]}
      />
      {sections.length ? (
        sections.map(({ category, courses }) => (
          <CategorySection
            key={category.id}
            category={category}
            courses={courses}
            viewAllLabel={`View All ${category.badge} Courses`}
          />
        ))
      ) : (
        <Section containerClassName="flex flex-col items-center gap-3 py-16 text-center">
          <h2 className="font-heading text-24 font-extrabold leading-native text-heading">No courses published yet</h2>
          <p className="font-sans text-15 leading-body text-muted">
            Our catalogue is being updated. Please check back soon or contact our admissions team.
          </p>
        </Section>
      )}
    </>
  );
}
