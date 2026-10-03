import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { routes } from "@/lib/constants";
import type { FaqItem } from "@/types";

export function FaqPreview({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Section tone="surface" tilt containerClassName="flex flex-col gap-10 xl:gap-12">
      <SectionHeading badge="Curated Queries" title="Frequently Asked Questions" align="center" />
      <FaqAccordion items={faqs} tone="elevated" allOpen answerLeading="normal" />
      <div data-reveal="up" className="flex justify-center">
        <Button href={routes.faq} variant="outline">
          View All FAQs
        </Button>
      </div>
    </Section>
  );
}
