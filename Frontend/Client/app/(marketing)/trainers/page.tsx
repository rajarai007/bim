import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { FinalCta } from "@/components/shared/final-cta";
import { TrainerCard } from "@/components/trainers/trainer-card";
import { getPageMetadata } from "@/features/pages/service";
import { getTrainers } from "@/features/trainers/service";
import { routes } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/trainers", {
    title: "Trainers",
    description:
      "Learn from experienced AEC industry professionals with decade-long real-world BIM and structural design consulting expertise.",
  });
}

export default async function TrainersPage() {
  const trainers = await getTrainers();
  return (
    <>
      <PageBanner
        title="Meet Our Expert Trainers"
        description="Learn from experienced AEC industry professionals with decade-long real-world BIM and structural design consulting expertise."
        crumbs={[{ label: "Home", href: routes.home }, { label: "Trainers" }]}
      />
      <Section
        stagger="up"
        containerClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:gap-x-8 xl:gap-y-12"
      >
        {trainers.length ? (
          trainers.map((trainer) => <TrainerCard key={trainer.id} trainer={trainer} />)
        ) : (
          <p className="font-sans text-15 leading-body text-muted sm:col-span-2 lg:col-span-4">
            Our trainer profiles are being updated. Please check back soon.
          </p>
        )}
      </Section>
      <FinalCta
        variant="outline"
        title="Want to learn from our expert trainers?"
        description="Don't settle for basic CAD software definitions. Outline your actual AEC digital construction career roadmap with our admission counselors today."
      />
    </>
  );
}
