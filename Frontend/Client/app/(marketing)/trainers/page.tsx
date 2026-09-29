import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { FinalCta } from "@/components/shared/final-cta";
import { TrainerCard, trainerColumn } from "@/components/trainers/trainer-card";
import { getPageMetadata } from "@/features/pages/service";
import { getTrainers } from "@/features/trainers/service";
import { routes } from "@/lib/constants";
import { PageTransition } from "@/components/motion/page-transition";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/trainers", {
    title: "Trainers",
    description:
      "Learn from experienced AEC industry professionals with real-world BIM and structural design expertise.",
  });
}

export default async function TrainersPage() {
  const trainers = await getTrainers();
  return (
    <PageTransition>
      <PageBanner
        title="Meet Our Expert Trainers"
        description="Learn from experienced AEC industry professionals with real-world BIM and structural design expertise."
        crumbs={[{ label: "Home", href: routes.home }, { label: "Trainers" }]}
      />
      <Section
        stagger="up"
        containerClassName="flex flex-wrap justify-center gap-6 lg:gap-8 xl:gap-x-8 xl:gap-y-12"
      >
        {trainers.length ? (
          trainers.map((trainer) => (
            <div key={trainer.id} className={trainerColumn}>
              <TrainerCard trainer={trainer} />
            </div>
          ))
        ) : (
          <p className="w-full font-sans text-15 leading-body text-muted">
            Our trainer profiles are being updated. Please check back soon.
          </p>
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
