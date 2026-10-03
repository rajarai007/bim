import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { FinalCta } from "@/components/shared/final-cta";
import { TrainerCard } from "@/components/trainers/trainer-card";
import { getPageMetadata } from "@/features/pages/service";
import { getTrainers } from "@/features/trainers/service";
import { routes } from "@/lib/constants";
import { trainerSchema } from "@/lib/schema";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/trainers", {
    title: "BIM & Revit Trainers | BIM Career Academy",
    description:
      "Meet the trainers at BIM Career Academy, New Delhi, and see their experience, specialisations and the BIM, Revit and structural software they teach.",
  });
}

export default async function TrainersPage() {
  const trainers = await getTrainers();
  return (
    <PageTransition>
      {trainers.length ? <JsonLd data={trainerSchema(trainers)} /> : null}
      <PageBanner
        title="Meet Our Expert Trainers"
        description="Learn from experienced AEC industry professionals with real-world BIM and structural design expertise."
        crumbs={[{ label: "Home", href: routes.home }, { label: "Trainers" }]}
      />
      <Section
        stagger="flip"
        containerClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:gap-x-8 xl:gap-y-12"
      >
        {trainers.length ? (
          trainers.map((trainer) => <TrainerCard key={trainer.id} trainer={trainer} />)
        ) : (
          <div className="state-panel sm:col-span-2 lg:col-span-4">
            <p className="font-sans text-15 leading-body text-muted">Our trainer profiles are being updated. Please check back soon.</p>
          </div>
        )}
      </Section>
      <FinalCta
        variant="outline"
        title="Want to learn from our expert trainers?"
        description="Don't settle for basic CAD software definitions. Outline your actual AEC digital construction career roadmap with our admission counselors today."
      />
    </PageTransition>
  );
}
