/**
 * Canonical origin of the public site. Canonical URLs, the sitemap, Open Graph
 * tags and JSON-LD are all built from it, so previews and local builds still
 * point search engines at the production domain.
 */
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://bimcareeracademy.com").replace(/\/+$/, "");

export const siteConfig = {
  name: "BIM Career Academy",
  shortName: "BIM CAREER",
  tagline: "ACADEMY",
  url: siteUrl,
  /** Default meta description: the home page's, and the fallback for pages without their own. */
  description:
    "BIM training institute in Delhi for Revit Architecture, Revit Structure, Revit MEP and Navisworks. Project-based classes at Okhla, New Delhi, and live online.",
  /** Share image for links posted on WhatsApp, LinkedIn, Facebook and X (1200×630). */
  ogImage: {
    url: "/images/og-default.jpg",
    width: 1200,
    height: 630,
    alt: "BIM Career Academy: BIM, Revit, structural and MEP design training in New Delhi",
  },
  contact: {
    phone: "+91 84487 65107",
    phoneHref: "tel:+918448765107",
    whatsapp: "+91 84487 65107",
    whatsappHref: "https://wa.me/918448765107",
    email: "bimcareer1543@gmail.com",
    address: "Okhla Head, Jamia Nagar, New Delhi 110025, India",
  },
  /** `contact.address` split into schema.org PostalAddress parts for structured data. */
  postalAddress: {
    streetAddress: "Okhla Head, Jamia Nagar",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110025",
    addressCountry: "IN",
  },
  social: {
    instagram: "https://www.instagram.com/bimcareer/",
    facebook: "https://facebook.com",
    linkedin: "https://www.linkedin.com/company/bim-career-academy/",
    youtube: "https://youtube.com",
  },
} as const;
