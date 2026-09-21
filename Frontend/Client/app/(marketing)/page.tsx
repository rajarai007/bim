import type { Metadata } from "next";
import { AboutPreview } from "@/components/home/about-preview";
import { CareerJourney } from "@/components/home/career-journey";
import { CourseCategories } from "@/components/home/course-categories";
import { FaqPreview } from "@/components/home/faq-preview";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { Hero } from "@/components/home/hero";
import { PlacementSection } from "@/components/home/placement-section";
import { ProjectsShowcase } from "@/components/home/projects-showcase";
import { SoftwareSection } from "@/components/home/software-section";
import { Testimonials } from "@/components/home/testimonials";
import { TrainersSection } from "@/components/home/trainers-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { FinalCta } from "@/components/shared/final-cta";
import { getCategories, getHomeFeaturedCourses } from "@/features/courses/service";
import { getHomeFaqs } from "@/features/faq/service";
import { getPageMetadata } from "@/features/pages/service";
import { getShowcaseProjects } from "@/features/projects/service";
import { getTestimonials } from "@/features/testimonials/service";
import { getHomeTrainers } from "@/features/trainers/service";
import { siteConfig } from "@/lib/config";
import { PageTransition } from "@/components/motion/page-transition";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/", { title: siteConfig.name, description: siteConfig.description });
}

export default async function HomePage() {
  const [categories, featured, projects, trainers, testimonials, faqs] = await Promise.all([
    getCategories(),
    getHomeFeaturedCourses(),
    getShowcaseProjects(),
    getHomeTrainers(),
    getTestimonials(),
    getHomeFaqs(),
  ]);

  return (
    <PageTransition>
      <Hero />
      <AboutPreview />
      {categories.length ? <CourseCategories categories={categories} /> : null}
      {featured.length ? <FeaturedCourses courses={featured} /> : null}
      <SoftwareSection />
      <WhyChooseUs />
      <PlacementSection />
      {projects.length ? <ProjectsShowcase projects={projects} /> : null}
      {trainers.length ? <TrainersSection trainers={trainers} /> : null}
      {testimonials.length ? <Testimonials testimonials={testimonials} /> : null}
      <CareerJourney />
      {faqs.length ? <FaqPreview faqs={faqs} /> : null}
      <FinalCta
        title="Ready to Build Your Career in BIM & Design?"
        description="Don't settle for basic software training. Gain actual industry-standard technical competence. Contact our admissions counselor today!"
      />
    </PageTransition>
  );
}
