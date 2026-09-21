import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdvisorCta } from "@/components/courses/advisor-cta";
import { FeaturedCourseCard, StandardCourseCard } from "@/components/courses/course-card";
import { CourseDurationTable } from "@/components/courses/course-duration-table";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategoryBySlug, getCoursesByCategory } from "@/features/courses/service";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/motion/page-transition";

/**
 * Four cards per row at desktop; a partial final row of 2–3 cards stretches
 * to fill the width (as in the design). Uses a 12-column grid so
 * 4 → span 3, 3 → span 4, 2 → span 6. A lone trailing card keeps normal width.
 */
const spanClasses: Record<number, string> = {
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  6: "xl:col-span-6",
};

function trailingSpan(index: number, total: number): string {
  const remainder = total % 4;
  const inLastRow = remainder > 1 && index >= total - remainder;
  return spanClasses[inLastRow ? 12 / remainder : 3];
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  // Thrown here (before streaming starts) so the response carries a real 404 status.
  if (!category) notFound();
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({ params }: PageProps<"/courses/[category]">) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const all = await getCoursesByCategory(category.slug);
  const featured = all.filter((course) => course.featured);

  return (
    <PageTransition>
      <PageBanner
        title={category.name}
        description={category.description}
        glyph="wide"
        crumbs={[
          { label: "Home", href: routes.home },
          { label: "Courses", href: routes.courses },
          { label: category.name },
        ]}
      />

      {featured.length ? (
        <Section containerClassName="flex flex-col gap-8 xl:gap-10">
          <SectionHeading badge="Admissions Active" badgeTone="primary" title="Featured Programs" />
          <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <FeaturedCourseCard
                key={course.slug}
                size="lg"
                href={routes.course(category.slug, course.slug)}
                title={course.title}
                badge={course.badge}
                description={course.description}
                image={course.image}
                meta={{ kind: "duration", label: course.duration }}
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="surface" containerClassName="flex flex-col gap-10 xl:gap-12">
        <h2 data-reveal="up" className="font-heading text-28 font-extrabold leading-native text-heading xl:text-36">
          All {category.badge} Courses
        </h2>
        {all.length ? (
          <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12">
            {all.map((course, index) => (
              <div key={course.slug} className={cn("min-w-0", trailingSpan(index, all.length))}>
                <StandardCourseCard
                  href={routes.course(category.slug, course.slug)}
                  title={course.title}
                  description={course.description}
                  duration={course.duration}
                  image={course.image}
                  // Featured courses already carry the morph name in the row above.
                  morph={!course.featured}
                />
              </div>
            ))}
          </div>
        ) : (
          <p data-reveal="up" className="font-sans text-15 leading-body text-muted">
            New {category.badge} programs are being scheduled. Contact our admissions team for upcoming batch dates.
          </p>
        )}
      </Section>

      {all.length ? (
        <Section containerClassName="flex flex-col gap-8 xl:gap-10">
          <div data-reveal-stagger="up" className="flex w-full flex-col items-start gap-2 leading-native">
            <h2 className="font-heading text-28 font-extrabold text-heading xl:text-36">Course Duration &amp; Syllabus</h2>
            <p className="font-sans text-16 text-muted">
              Download the detailed syllabus of any {category.badge} program.
            </p>
          </div>
          <CourseDurationTable category={category} courses={all} />
        </Section>
      ) : null}

      <AdvisorCta />
    </PageTransition>
  );
}
