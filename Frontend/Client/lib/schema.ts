/**
 * schema.org structured data (JSON-LD) builders. Everything here is derived from
 * what the page itself shows: the academy's contact details, the catalogue and
 * the FAQs. Nothing is invented: no ratings, reviews, prices or coordinates,
 * because the site does not publish any.
 */
import { brand } from "@/components/icons/logo";
import { founderMessage } from "@/data/site";
import { siteConfig } from "@/lib/config";
import { routes } from "@/lib/constants";
import { PLACEHOLDER_IMAGE } from "@/lib/media";
import { absoluteUrl } from "@/lib/seo";
import type { Course, CourseDetail, SiteSettings, Trainer } from "@/types";

type Schema = Record<string, unknown>;

const CONTEXT = "https://schema.org";
/** Stable node ids so pages can point at the academy without repeating it. */
export const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

/** Drops `undefined`, empty strings and empty arrays so the output only states what is known. */
function compact(node: Schema): Schema {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)),
  );
}

/** A profile URL has a path; a bare `https://facebook.com` is the seeded placeholder. */
function isProfileUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).pathname.replace(/\/+$/, "") !== "";
  } catch {
    return false;
  }
}

/**
 * Catalogue images live on the API origin. Structured data points at the copy
 * served through this site's image optimizer, so crawlers stay on one domain.
 */
function imageUrl(src: string): string | undefined {
  if (!src || src === PLACEHOLDER_IMAGE) return undefined;
  if (src.startsWith("/")) return absoluteUrl(src);
  return absoluteUrl(`/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`);
}

const squash = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The split address in `siteConfig` only describes the address shipped with the
 * site. If the admin console holds a different one, publish that line as written
 * rather than parts that no longer match it.
 */
function postalAddress(address: string): Schema {
  if (squash(address) === squash(siteConfig.contact.address)) {
    return { "@type": "PostalAddress", ...siteConfig.postalAddress };
  }
  return { "@type": "PostalAddress", streetAddress: address, addressCountry: siteConfig.postalAddress.addressCountry };
}

function to24h(hour: string, minute: string | undefined, meridiem: string): string {
  const h = (Number(hour) % 12) + (meridiem.toLowerCase() === "pm" ? 12 : 0);
  return `${String(h).padStart(2, "0")}:${minute ?? "00"}`;
}

/**
 * Working hours are free text in the admin console. Only the unambiguous
 * "Mon - Sat (9:00 AM - 6:30 PM)" shape is turned into structured hours; anything
 * else is left out instead of guessed.
 */
export function openingHours(hours: string | null): Schema | undefined {
  if (!hours) return undefined;
  const match = hours.match(
    /^\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s*(?:-|–|—|to)\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s*[(,:]?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*\)?\s*$/i,
  );
  if (!match) return undefined;
  const [, from, to, openHour, openMinute, openMeridiem, closeHour, closeMinute, closeMeridiem] = match;
  const start = WEEKDAYS.findIndex((day) => day.toLowerCase().startsWith(from.toLowerCase()));
  const end = WEEKDAYS.findIndex((day) => day.toLowerCase().startsWith(to.toLowerCase()));
  if (start < 0 || end < start) return undefined;
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: WEEKDAYS.slice(start, end + 1),
    opens: to24h(openHour, openMinute, openMeridiem),
    closes: to24h(closeHour, closeMinute, closeMeridiem),
  };
}

/**
 * The academy as both an educational organization and a local business with a
 * walk-in address. Rendered on every page (see SiteChrome) so the other nodes
 * can reference it by id.
 */
export function organizationSchema(settings: SiteSettings): Schema {
  const { contact, social } = settings;
  const telephone = contact.phoneHref.replace(/^tel:/, "");
  return compact({
    "@context": CONTEXT,
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORGANIZATION_ID,
    name: settings.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl(brand.mark),
    image: absoluteUrl(siteConfig.ogImage.url),
    description: siteConfig.description,
    telephone,
    email: contact.email,
    address: postalAddress(contact.address),
    openingHoursSpecification: openingHours(contact.hours),
    founder: { "@type": "Person", name: founderMessage.name },
    contactPoint: compact({
      "@type": "ContactPoint",
      contactType: "admissions",
      telephone,
      email: contact.email,
    }),
    sameAs: [social.instagram, social.facebook, social.linkedin, social.youtube].filter(isProfileUrl),
  });
}

/** Home page only: tells search engines the site's name. */
export function websiteSchema(): Schema {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "en-IN",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Mirrors the visible breadcrumb trail; the last crumb is the page itself, so it carries no URL. */
export function breadcrumbSchema(items: { label: string; href?: string }[]): Schema {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: item.href ? absoluteUrl(item.href) : undefined,
      }),
    ),
  };
}

/** "Offline & Online" → Onsite + Online. Unrecognised wording yields nothing. */
function courseModes(mode: string): string[] {
  const modes: string[] = [];
  if (/offline|on-?site|classroom|lab\b|in-?person/i.test(mode)) modes.push("Onsite");
  if (/online|remote|virtual/i.test(mode.replace(/offline/gi, ""))) modes.push("Online");
  return modes;
}

/**
 * One course. Duration, mode, outcomes and prerequisites come straight from the
 * course record; price, rating and instructor are omitted because the site does
 * not publish them.
 */
export function courseSchema(course: CourseDetail): Schema {
  const url = absoluteUrl(routes.course(course.category.slug, course.slug));
  const modes = courseModes(course.detail.meta.mode);
  return compact({
    "@context": CONTEXT,
    "@type": "Course",
    "@id": `${url}#course`,
    name: course.title,
    description: course.seo.description || course.description,
    url,
    image: imageUrl(course.image.src),
    provider: { "@type": "EducationalOrganization", "@id": ORGANIZATION_ID, name: siteConfig.name, url: absoluteUrl("/") },
    timeRequired: `P${course.durationWeeks}W`,
    teaches: course.detail.outcomes,
    coursePrerequisites: course.detail.eligibility,
    hasCourseInstance: modes.length
      ? compact({
          "@type": "CourseInstance",
          courseMode: modes,
          location: modes.includes("Onsite") ? { "@id": ORGANIZATION_ID } : undefined,
        })
      : undefined,
  });
}

/** Only for questions and answers that are visible on the same page. */
export function faqSchema(faqs: { question: string; answer: string }[]): Schema {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** A listing page (all courses, or one category) as an ordered list of course URLs. */
export function courseListSchema(name: string, courses: Course[]): Schema {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name,
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: course.title,
      url: absoluteUrl(routes.course(course.category.slug, course.slug)),
    })),
  };
}

/** Trainer profiles as shown on the Trainers page. */
export function trainerSchema(trainers: Trainer[]): Schema[] {
  return trainers.map((trainer) =>
    compact({
      "@context": CONTEXT,
      "@type": "Person",
      name: trainer.name,
      jobTitle: trainer.role,
      description: trainer.bio,
      image: imageUrl(trainer.image.src),
      knowsAbout: trainer.tags,
      worksFor: { "@id": ORGANIZATION_ID },
      sameAs: isProfileUrl(trainer.linkedin) ? [trainer.linkedin] : undefined,
    }),
  );
}
