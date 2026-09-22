import type { Metadata } from "next";
import { AboutCta } from "@/components/about/about-cta";
import { FounderMessage } from "@/components/about/founder-message";
import { IntroSection } from "@/components/about/intro-section";
import { PhilosophySection } from "@/components/about/philosophy-section";
import { StrengthsSection } from "@/components/about/strengths-section";
import { PageBanner } from "@/components/layout/page-banner";
import { getPageMetadata } from "@/features/pages/service";
import { routes } from "@/lib/constants";
import { PageTransition } from "@/components/motion/page-transition";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/about", {
    title: "About Us",
    description:
      "BIM Career Academy delivers practical, industry-aligned offline & online training in BIM, structural, MEP and interior design software.",
  });
}

export default function AboutPage() {
  return (
    <PageTransition>
      <PageBanner
        title="About BIM Career Academy"
        crumbs={[{ label: "Home", href: routes.home }, { label: "About Us" }]}
      />
      <IntroSection />
      <FounderMessage />
      <PhilosophySection />
      <StrengthsSection />
      <AboutCta />
    </PageTransition>
  );
}
