import { Section } from "@/components/layout/section";
import { TrainerCardCompact, trainerColumn } from "@/components/trainers/trainer-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Trainer } from "@/types";

export function TrainersSection({ trainers }: { trainers: Trainer[] }) {
  return (
    <Section padding="lg" tilt containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading
        badge="Learn from AEC Veterans"
        badgeTone="primary"
        title="Meet Our Expert Trainers"
        align="center"
      />
      {/* Flex rather than grid so a short last row (or a single trainer) sits centered. */}
      <div data-reveal-stagger="flip" className="flex flex-wrap justify-center gap-6 lg:gap-8">
        {trainers.map((trainer) => (
          <div key={trainer.id} className={trainerColumn}>
            <TrainerCardCompact trainer={trainer} />
          </div>
        ))}
      </div>
    </Section>
  );
}
