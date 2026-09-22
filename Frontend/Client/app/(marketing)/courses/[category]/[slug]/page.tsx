import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { CheckWide } from "@/components/icons/check-wide";
import { CompactCourseCard, courseMorphName } from "@/components/courses/course-card";
import { EnquiryCard } from "@/components/courses/enquiry-card";
import { SyllabusAccordion } from "@/components/courses/syllabus-accordion";
import { SyllabusRequestDialog } from "@/components/courses/syllabus-request-dialog";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SplitWords } from "@/components/motion/split-words";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, SoftwareChip } from "@/components/ui/chip";
import { getCourseBySlug } from "@/features/courses/service";
import { getSiteSettings } from "@/features/settings/service";
import { routes } from "@/lib/constants";
import { PageTransition } from "@/components/motion/page-transition";

type Props = PageProps<"/courses/[category]/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const course = await getCourseBySlug(slug);
  // Thrown here (before streaming starts) so the response carries a real 404 status.
  if (!course || course.category.slug !== categorySlug) notFound();
  return { title: { absolute: course.seo.title }, description: course.seo.description };
}

const h2 =
  "font-heading text-24 font-extrabold leading-native text-heading xl:text-28";

export default async function CoursePage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const [course, settings] = await Promise.all([getCourseBySlug(slug), getSiteSettings()]);
  if (!course || course.category.slug !== categorySlug) notFound();

  const { detail, related, category } = course;
  const meta = [
    ["Duration", detail.meta.duration],
    ["Training Mode", detail.meta.mode],
    ["Admissions", detail.meta.admissions],
  ].filter(([, value]) => value);

  return (
    <PageTransition>
      <Container className="pt-6" data-reveal="fade">
        <Breadcrumb
          glyph="wide"
          items={[
            { label: "Home", href: routes.home },
            { label: "Courses", href: routes.courses },
            { label: category.name, href: routes.category(category.slug) },
            { label: course.title },
          ]}
        />
      </Container>

      {/* Hero */}
      <Section
        padding="md"
        containerClassName="flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
      >
        <div className="flex w-full min-w-0 flex-col items-start gap-6 md:gap-8 lg:flex-1">
          <div data-reveal="left">
            <Badge tone="primary">{category.name}</Badge>
          </div>
          <h1
            data-reveal="words"
            data-reveal-delay="1"
            className="font-heading text-32 font-black leading-native text-heading md:text-40 xl:text-48"
          >
            <SplitWords text={detail.heroTitle} />
          </h1>
          <p data-reveal="up" data-reveal-delay="4" className="font-sans text-16 leading-body text-muted">
            {detail.heroDescription}
          </p>
          {/* Key facts as a viewer-style spec strip. */}
          <dl
            data-reveal-stagger="scale"
            className="flex w-full flex-wrap items-start gap-3 leading-native [--stagger-offset:500ms]"
          >
            {meta.map(([label, value], index) => (
              <div
                key={label}
                data-tilt
                className="glass glass-edge flex flex-col items-start gap-1.5 rounded-md px-4 py-3 transition-[border-color,translate] duration-300 ease-brand hover:-translate-y-0.5 hover:border-primary/50"
              >
                <dt className="hud-key flex items-center gap-2">
                  <span className="hud-dot" data-tone={index % 2 ? "primary" : undefined} />
                  {label}
                </dt>
                <dd className="font-heading text-15 font-extrabold text-heading">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div
            data-reveal-stagger="up"
            className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start sm:gap-4 [--stagger-offset:750ms]"
          >
            <Button href={routes.contact} size="lg">
              Enquire Now
            </Button>
            <SyllabusRequestDialog
              courseTitle={course.title}
              courseSlug={course.slug}
              href={routes.courseSyllabus(category.slug, course.slug)}
            />
          </div>
        </div>
        {/* Morph target for the course-card photo (same ViewTransition name).
            No scroll reveal here: a hidden state at capture time would make
            the morph land on an empty frame. */}
        <div className="group relative h-[240px] w-full shrink-0 overflow-hidden rounded-lg shadow-[var(--shadow-sheet-lifted)] sm:h-[320px] lg:h-[420px] lg:flex-1">
          <ViewTransition name={courseMorphName(course.slug)} share="vt-morph" default="none">
            <div className="absolute inset-0">
              <Image
                src={course.image.src}
                alt={course.image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                preload
                loading="eager"
                className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
              />
            </div>
          </ViewTransition>
          {/* Viewer frame: corner ticks and a level line, like a capture from the model. */}
          <div aria-hidden className="viewer-frame pointer-events-none absolute inset-0 rounded-[inherit]" />
        </div>
      </Section>

      {/* Main content + sidebar */}
      <Section
        padding="none"
        containerClassName="flex flex-col items-start gap-12 pb-14 md:pb-20 lg:flex-row lg:gap-16 xl:pb-25"
      >
        <div className="flex w-full min-w-0 flex-col items-start gap-12 lg:flex-1">
          <div data-reveal="up" className="flex w-full flex-col gap-4">
            <h2 className={h2}>Course Overview</h2>
            <p className="font-sans text-15 leading-body text-muted">
              {detail.overview}
            </p>
          </div>

          {detail.outcomes.length ? (
            <div className="flex w-full flex-col gap-5">
              <h2 data-reveal="up" className={h2}>What You Will Learn</h2>
              <ul data-reveal-stagger="left" className="flex w-full flex-col gap-3 [--stagger-step:60ms]">
                {detail.outcomes.map((item) => (
                  <li key={item} className="group flex w-full items-center gap-2.5">
                    <CheckWide size={16} className="text-accent transition-transform duration-300 ease-brand group-hover:scale-125" />
                    <span className="font-sans text-15 font-semibold leading-native text-body">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail.modules.length ? (
            <div className="flex w-full flex-col gap-5">
              <h2 data-reveal="up" className={h2}>Syllabus Modules</h2>
              <SyllabusAccordion modules={detail.modules} />
            </div>
          ) : null}

          {detail.software.length ? (
            <div className="flex w-full flex-col gap-5">
              <h2 data-reveal="up" className="font-heading text-24 font-extrabold leading-native text-heading">
                Software Covered
              </h2>
              <ul data-reveal-stagger="scale" className="flex w-full flex-wrap gap-3 [--stagger-step:50ms]">
                {detail.software.map((s) => (
                  <li key={s}>
                    <SoftwareChip label={s} size="sm" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail.whoShouldJoin || detail.eligibility ? (
            <div data-reveal-stagger="up" className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 [--stagger-step:150ms]">
              {detail.whoShouldJoin ? (
                <div data-spotlight data-tilt className="card-lift flex flex-col items-start gap-4 rounded-md bg-surface p-6">
                  <h2 className="font-heading text-20 font-extrabold leading-native text-heading">
                    Who Should Join
                  </h2>
                  <p className="font-sans text-14 leading-normal text-muted">
                    {detail.whoShouldJoin}
                  </p>
                </div>
              ) : null}
              {detail.eligibility ? (
                <div data-spotlight="accent" data-tilt className="card-lift flex flex-col items-start gap-4 rounded-md bg-surface p-6">
                  <h2 className="font-heading text-20 font-extrabold leading-native text-heading">
                    Eligibility
                  </h2>
                  <p className="font-sans text-14 leading-normal text-muted">
                    {detail.eligibility}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {detail.careers.length ? (
            <div className="flex w-full flex-col gap-4">
              <h2 data-reveal="up" className="font-heading text-24 font-extrabold leading-native text-heading">
                Career Opportunities
              </h2>
              <ul data-reveal-stagger="scale" className="flex w-full flex-wrap gap-2 [--stagger-step:50ms]">
                {detail.careers.map((c) => (
                  <li key={c}>
                    <Pill>{c}</Pill>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* `self-stretch` gives the sticky panel room to travel with the syllabus. */}
        <div className="w-full lg:w-[380px] lg:shrink-0 lg:self-stretch xl:w-[420px]">
          <EnquiryCard courseTitle={course.title} courseSlug={course.slug} contact={settings.contact} />
        </div>
      </Section>

      {related.length ? (
        <Section
          tone="surface"
          containerClassName="flex flex-col gap-8 xl:gap-10"
        >
          <h2 data-reveal="up" className="font-heading text-28 font-extrabold leading-native text-heading xl:text-32">
            Related Programs
          </h2>
          <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {related.map((r) => (
              <CompactCourseCard
                key={r.slug}
                href={routes.course(r.category.slug, r.slug)}
                title={r.title}
                description={r.description}
                image={r.image}
              />
            ))}
          </div>
        </Section>
      ) : null}
    </PageTransition>
  );
}
