import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { Section } from "@/components/layout/section";
import { getPageMetadata } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";
import { siteConfig } from "@/lib/config";
import { routes } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/privacy-policy", {
    title: "Privacy Policy",
    description: `How ${siteConfig.name} collects, uses and protects the information you share with us.`,
  });
}

const buildSections = (contact: { email: string; phone: string; address: string }) => [
  {
    title: "Information we collect",
    body: "When you submit an enquiry we collect the details you provide — typically your name, mobile number, email address, qualification, experience level and the course you are interested in — so that our admissions counselors can respond to you.",
  },
  {
    title: "How we use it",
    body: "Your details are used only to answer your query, share course information, batch schedules and fee structures, and to arrange a laboratory demo session if you request one. We do not sell or rent personal information to third parties.",
  },
  {
    title: "Communication",
    body: "By submitting an enquiry you agree to be contacted by our admissions team by phone, WhatsApp or email. You can ask us to stop contacting you at any time by writing to the address below.",
  },
  {
    title: "Data retention & security",
    body: "Enquiry records are kept only as long as needed to support your admission and are stored on access-controlled systems. Reasonable technical and organisational measures are in place to protect them.",
  },
  {
    title: "Contact",
    body: `For any privacy-related request, write to ${contact.email} or call ${contact.phone}. Our office is located at ${contact.address}.`,
  },
];

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const sections = buildSections(settings.contact);
  return (
    <>
      <PageBanner
        title="Privacy Policy"
        crumbs={[{ label: "Home", href: routes.home }, { label: "Privacy Policy" }]}
      />
      <Section padding="lg" containerClassName="flex max-w-[960px] flex-col gap-10">
        {sections.map((s) => (
          <article key={s.title} className="flex flex-col gap-3">
            <h2 className="font-heading text-22 font-extrabold leading-native text-white md:text-24">
              {s.title}
            </h2>
            <p className="font-sans text-15 leading-body text-muted">{s.body}</p>
          </article>
        ))}
      </Section>
    </>
  );
}
