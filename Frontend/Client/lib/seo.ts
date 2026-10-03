import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

/** Absolute URL on the canonical origin for a site path (`/courses` → `https://…/courses`). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path === "/" ? "" : `/${path.replace(/^\/+/, "")}`;
  return `${siteConfig.url}${clean}`;
}

/** `Revit Architecture Course` → `Revit Architecture Course | BIM Career Academy`. */
export function withSiteName(title: string): string {
  return title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
}

/**
 * Heading and title wording for a course: "Revit Architecture" → "Revit Architecture Course".
 * Titles that already say what they are ("… Training", "… Program") are left as written.
 */
export function courseHeading(title: string): string {
  return /\b(course|training|program(me)?|package|workshop|bootcamp|masterclass|certification|diploma)\b/i.test(title)
    ? title
    : `${title} Course`;
}

type ShareImage = { url: string; width?: number; height?: number; alt: string };

/**
 * Head tags for one indexable page: the title and description, a self-referencing
 * canonical, and matching Open Graph / X card tags.
 *
 * Next.js merges metadata shallowly, so a page that sets `openGraph` replaces the
 * root layout's object entirely; that is why the site name, locale and share image
 * are repeated here for every page instead of being inherited.
 *
 * `title` is used verbatim (the admin console and the page defaults both store the
 * complete title), bypassing the root layout's `%s | BIM Career Academy` template.
 */
export function buildMetadata({
  title,
  description,
  path,
  image = siteConfig.ogImage,
}: {
  title: string;
  description: string;
  /** Canonical path of the page, e.g. `/courses/mep-design`. */
  path: string;
  image?: ShareImage;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Indexable, with full snippets and large image previews allowed in results.
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "en_IN",
      url,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
