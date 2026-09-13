import { Section } from "@/components/layout/section";
import { TrainerCardCompact } from "@/components/trainers/trainer-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Trainer } from "@/types";

export function TrainersSection({ trainers }: { trainers: Trainer[] }) {
  return (
    <Section padding="lg" containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading
        badge="Learn from AEC Veterans"
        badgeTone="primary"
        title="Meet Our Expert Trainers"
        align="center"
      />
      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {trainers.map((trainer) => (
          <TrainerCardCompact key={trainer.id} trainer={trainer} />
        ))}
      </div>
    </Section>
  );
}
