import { Section } from "@/components/layout/section";
import { FeatureCard } from "@/components/shared/feature-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { whyChooseUs } from "@/data/site";

export function WhyChooseUs() {
  return (
    <Section
      id="why-choose-us"
      padding="lg"
      containerClassName="flex scroll-mt-20 flex-col gap-10 xl:gap-12"
    >
      <SectionHeading
        badge="Our Edge"
        badgeTone="primary"
        title="Why Choose BIM Career Academy?"
        align="center"
      />
      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {whyChooseUs.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} layout="row" />
        ))}
      </div>
    </Section>
  );
}
