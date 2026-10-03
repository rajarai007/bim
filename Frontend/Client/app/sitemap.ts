import type { MetadataRoute } from "next";
import { getCategories, getCourses } from "@/features/courses/service";
import { routes } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

/** Indexable static pages, in the order they are listed. */
const staticPaths = [
  routes.home,
  routes.courses,
  routes.about,
  routes.trainers,
  routes.projects,
  routes.faq,
  routes.contact,
  routes.privacy,
];

/**
 * /sitemap.xml, generated from the live catalogue: every static page plus each
 * category that has courses and each active course, at its canonical URL.
 * Hidden or draft courses never reach the public API, so they cannot appear
 * here; neither do the syllabus downloads. Regenerated with the rest of the
 * site (every minute at most, and right after an admin edit).
 *
 * `lastmod` is only given where the API reports a real edit time; a made-up date
 * would teach search engines to ignore the field.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // An unreachable API yields the static pages alone rather than a failing sitemap.
  const [categories, courses] = await Promise.all([getCategories().catch(() => []), getCourses().catch(() => [])]);
  // A category without published courses is a placeholder page (served `noindex`), so it is not listed.
  const listed = categories.filter((category) => courses.some((course) => course.category.slug === category.slug));

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...listed.map((category) => ({
      url: absoluteUrl(routes.category(category.slug)),
      lastModified: category.updatedAt,
    })),
    ...courses.map((course) => ({
      url: absoluteUrl(routes.course(course.category.slug, course.slug)),
      lastModified: course.updatedAt,
    })),
  ];
}
