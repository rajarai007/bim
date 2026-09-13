import { Section } from "@/components/layout/section";
import { ProjectShowcaseCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { routes } from "@/lib/constants";
import type { Project } from "@/types";

export function ProjectsShowcase({ projects }: { projects: Project[] }) {
  return (
    <Section tone="surface" containerClassName="flex flex-col gap-10 xl:gap-12">
      <div className="flex w-full flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          badge="Classroom Execution Portfolio"
          title="Our Training Projects"
          className="md:max-w-[600px]"
        />
        <div data-reveal="right" data-reveal-delay="2" className="shrink-0">
          <Button href={routes.projects} variant="outline">
            Explore Our Projects
          </Button>
        </div>
      </div>
      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <ProjectShowcaseCard key={project.id} project={project} />
        ))}
      </div>
    </Section>
  );
}
