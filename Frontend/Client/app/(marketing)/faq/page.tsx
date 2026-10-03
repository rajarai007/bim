import type { Metadata } from "next";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { FinalCta } from "@/components/shared/final-cta";
import { getFaqCategories, getPageFaqs } from "@/features/faq/service";
import { getPageMetadata } from "@/features/pages/service";
import { routes } from "@/lib/constants";
import { faqSchema } from "@/lib/schema";
import { PageTransition } from "@/components/motion/page-transition";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/faq", {
    title: "BIM Course FAQs | BIM Career Academy",
    description:
      "Answers to common questions about BIM and Revit training at BIM Career Academy, New Delhi: courses, duration, eligibility, online classes and fees.",
  });
}

export default async function FaqPage() {
  const [categories, faqs] = await Promise.all([getFaqCategories(), getPageFaqs()]);
  return (
    <PageTransition>
      {/* Every question below is in the page HTML (collapsed ones included), so the markup matches what is shown. */}
      {faqs.length ? <JsonLd data={faqSchema(faqs)} /> : null}
      <PageBanner
        title="Frequently Asked Questions"
        description="Have queries about enrollment process, batches, course certifications, or technical workstation facilities? Find answers curated directly below."
        crumbs={[{ label: "Home", href: routes.home }, { label: "FAQ" }]}
      />
      <Section>
        <FaqBrowser categories={categories} faqs={faqs} />
      </Section>
      <FinalCta
        variant="outline"
        title="Still have questions?"
        description="Our admissions counselors can walk you through batches, fees, certifications and the right software track for your career."
      />
    </PageTransition>
  );
}
