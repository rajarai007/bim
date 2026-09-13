import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FaqItem } from "@/types";

export function FaqPreview({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Section tone="surface" containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading badge="Curated Queries" title="Frequently Asked Questions" align="center" />
      <FaqAccordion items={faqs} tone="elevated" allOpen answerLeading="normal" />
    </Section>
  );
}
