import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactInfo } from "@/components/forms/contact-info";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { getCourses } from "@/features/courses/service";
import { getPageMetadata } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";
import { routes } from "@/lib/constants";

const defaults = {
  title: "Contact",
  description: "Submit your training query or visit our workstation lab in Okhla, New Delhi. Call, WhatsApp or email the admissions team.",
};

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/contact", defaults);
}

export default async function ContactPage() {
  const [courses, settings] = await Promise.all([getCourses(), getSiteSettings()]);
  const courseOptions = courses.map((c) => ({ slug: c.slug, title: c.title }));

  return (
    <>
      <PageBanner
        title="Contact Our Academy"
        image="/images/contact-banner.png"
        crumbs={[{ label: "Home", href: routes.home }, { label: "Contact" }]}
      />
      <Section padding="lg" containerClassName="flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
        <div className="flex w-full min-w-0 flex-col items-start gap-8 lg:flex-1">
          <div data-reveal-stagger="up" className="flex w-full flex-col items-start gap-3">
            <Badge tone="primary">Connect</Badge>
            <h2 className="font-heading text-28 font-extrabold leading-native text-heading xl:text-32">
              Submit Your Training Query
            </h2>
          </div>
          <div data-reveal="up" data-reveal-delay="2" className="w-full">
            <ContactForm courses={courseOptions} />
          </div>
        </div>
        <ContactInfo contact={settings.contact} />
      </Section>
    </>
  );
}
