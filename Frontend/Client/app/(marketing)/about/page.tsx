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
    title: "About BIM Career Academy | BIM Institute in New Delhi",
    description:
      "BIM Career Academy is a BIM institute in Okhla, New Delhi, founded by Mohd Asif. Practical Revit, Navisworks, structural and MEP training, offline and online.",
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
