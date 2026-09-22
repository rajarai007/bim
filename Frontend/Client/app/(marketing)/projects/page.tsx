import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageBanner } from "@/components/layout/page-banner";
import { ProjectFilters } from "@/components/projects/project-filters";
import { FinalCta } from "@/components/shared/final-cta";
import { getCategories } from "@/features/courses/service";
import { getPageMetadata } from "@/features/pages/service";
import { getProjects } from "@/features/projects/service";
import { routes } from "@/lib/constants";
import { PageTransition } from "@/components/motion/page-transition";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/projects", {
    title: "Projects",
    description:
      "Explore the practical digital construction, structural framing, and high-fidelity rendering projects executed by our students.",
  });
}

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([getProjects(), getCategories()]);
  return (
    <PageTransition>
      <PageBanner
        title="Our Training Portfolio"
        description="Explore the practical digital construction, structural framing, and high-fidelity rendering projects executed by our students."
        crumbs={[{ label: "Home", href: routes.home }, { label: "Projects" }]}
      />
      <Container>
        <ProjectFilters projects={projects} categories={categories} />
      </Container>
      <FinalCta
        variant="outline"
        title="Ready to build your own portfolio?"
        description="Work on real building assets, clash coordination and rendering runs in our offline & online workstation lab. Talk to our admissions counselors today."
      />
    </PageTransition>
  );
}
