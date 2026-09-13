import { Section } from "@/components/layout/section";
import { FeatureCard } from "@/components/shared/feature-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { institutionalStrengths } from "@/data/site";

export function StrengthsSection() {
  return (
    <Section padding="lg" containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading badge="Our Foundations" title="Key Institutional Strengths" align="center" />
      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {institutionalStrengths.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} layout="column" />
        ))}
      </div>
    </Section>
  );
}
