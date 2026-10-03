import type { Page } from "@playwright/test";
import { test, expect } from "../../helpers/fixtures";
import { apiData } from "../../helpers/api";
import { CLIENT_URL } from "../../playwright.config";

/**
 * Search-engine contract of the public site: every indexable page has one H1,
 * a unique title and description, a self-referencing canonical and share tags;
 * structured data parses and matches what the page shows; robots.txt and the
 * sitemap list exactly the canonical URLs; nothing that should stay out of the
 * index (404s, downloads) is indexable.
 */
const staticPages = ["/", "/about", "/courses", "/trainers", "/projects", "/faq", "/contact", "/privacy-policy"];

type Course = { slug: string; title: string; category: { slug: string } };
type Category = { slug: string; name: string };
type Node = Record<string, unknown>;

/** Every JSON-LD node on the page. A block that is not valid JSON fails the test here. */
async function structuredData(page: Page): Promise<Node[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((block) => {
    const parsed = JSON.parse(block) as Node | Node[];
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

const ofType = (nodes: Node[], type: string) =>
  nodes.filter((node) => (Array.isArray(node["@type"]) ? (node["@type"] as string[]).includes(type) : node["@type"] === type));

const pathOf = (url: string | null) => new URL(url ?? "", CLIENT_URL).pathname;

/** Title and meta description straight from the served HTML (no browser needed). */
async function headOf(path: string): Promise<{ title: string; description: string }> {
  const html = await (await fetch(`${CLIENT_URL}${path}`)).text();
  const decode = (value: string) => value.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  return {
    title: decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? ""),
    description: decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? ""),
  };
}

for (const path of staticPages) {
  test(`${path} has one h1, a canonical URL, share tags and organization data`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical, "canonical is absolute").toMatch(/^https?:\/\//);
    expect(pathOf(canonical)).toBe(path);

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("index, follow");
    expect(robots).not.toContain("noindex");

    const title = await page.title();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical!);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", /BIM Career Academy/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description!.length, "description length").toBeGreaterThan(50);
    expect(description!.length, "description length").toBeLessThanOrEqual(170);

    // The share image exists and is the 1200×630 card.
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect((await fetch(`${CLIENT_URL}${pathOf(image)}`)).status).toBe(200);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");

    // The academy's name, address and phone are published as structured data on every page.
    const [organization] = ofType(await structuredData(page), "LocalBusiness");
    expect(organization).toMatchObject({ name: expect.any(String), telephone: expect.stringMatching(/^\+\d+$/), address: { "@type": "PostalAddress" } });
  });
}

test("titles and descriptions are unique across every indexable page", async () => {
  const [categories, courses] = await Promise.all([
    apiData<Category[]>("GET", "/categories", { auth: false }),
    apiData<Course[]>("GET", "/courses", { auth: false }),
  ]);
  const paths = [
    ...staticPages,
    ...categories.map((c) => `/courses/${c.slug}`),
    ...courses.map((c) => `/courses/${c.category.slug}/${c.slug}`),
  ];
  const heads = await Promise.all(paths.map(headOf));
  for (const [i, head] of heads.entries()) {
    expect(head.title, `${paths[i]} title`).not.toBe("");
    expect(head.description, `${paths[i]} description`).not.toBe("");
  }
  expect(new Set(heads.map((h) => h.title)).size, "unique titles").toBe(paths.length);
  expect(new Set(heads.map((h) => h.description)).size, "unique descriptions").toBe(paths.length);
});

test("robots.txt allows crawling and points at the sitemap", async () => {
  const res = await fetch(`${CLIENT_URL}/robots.txt`);
  expect(res.status).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-Agent: \*/i);
  expect(body).toMatch(/^Allow: \/$/m);
  expect(body).toMatch(/^Disallow: \/api\/$/m);
  // Rendering resources must stay crawlable.
  expect(body).not.toMatch(/Disallow: \/_next/);
  expect(body).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m);
});

test("sitemap.xml lists every canonical page of the live catalogue and nothing else", async () => {
  const [categories, courses] = await Promise.all([
    apiData<Category[]>("GET", "/categories", { auth: false }),
    apiData<Course[]>("GET", "/courses", { auth: false }),
  ]);
  const res = await fetch(`${CLIENT_URL}/sitemap.xml`);
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("xml");
  const listed = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => pathOf(m[1]));
  const expected = [
    ...staticPages,
    // Categories without published courses are placeholders and stay out.
    ...categories.filter((c) => courses.some((course) => course.category.slug === c.slug)).map((c) => `/courses/${c.slug}`),
    ...courses.map((c) => `/courses/${c.category.slug}/${c.slug}`),
  ];
  expect([...listed].sort()).toEqual([...expected].sort());
  expect(new Set(listed).size, "no duplicate URLs").toBe(listed.length);
});

test("a course page carries Course, FAQPage and BreadcrumbList data that match the page", async ({ page }) => {
  const courses = await apiData<Course[]>("GET", "/courses", { auth: false });
  const course = courses.find((c) => c.slug === "revit-architecture") ?? courses[0];
  const path = `/courses/${course.category.slug}/${course.slug}`;
  await page.goto(path);
  const nodes = await structuredData(page);

  const [courseNode] = ofType(nodes, "Course");
  expect(courseNode).toMatchObject({ name: course.title, provider: { name: "BIM Career Academy" }, timeRequired: expect.stringMatching(/^P\d+W$/) });
  expect(pathOf(courseNode.url as string)).toBe(path);
  // Nothing the site does not publish: no price, rating or review.
  for (const key of ["offers", "aggregateRating", "review"]) expect(courseNode).not.toHaveProperty(key);

  // Every marked-up question is visible on the page with the same answer.
  const [faq] = ofType(nodes, "FAQPage");
  const questions = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  expect(questions.length).toBeGreaterThan(0);
  for (const q of questions) {
    await expect(page.getByRole("button", { name: q.name, exact: true })).toBeVisible();
    await expect(page.getByText(q.acceptedAnswer.text, { exact: true })).toBeVisible();
  }

  const [breadcrumbs] = ofType(nodes, "BreadcrumbList");
  const trail = breadcrumbs.itemListElement as { name: string; item?: string }[];
  expect(trail.map((item) => item.name)).toEqual(await page.getByRole("navigation", { name: "Breadcrumb" }).locator("li").allTextContents());
  expect(trail.slice(0, -1).map((item) => pathOf(item.item!))).toEqual(["/", "/courses", `/courses/${course.category.slug}`]);
});

test("FAQ page structured data matches the published questions", async ({ page }) => {
  const faqs = await apiData<{ question: string; answer: string }[]>("GET", "/faqs", { auth: false });
  await page.goto("/faq");
  const [faq] = ofType(await structuredData(page), "FAQPage");
  const marked = (faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));
  expect(marked).toEqual(faqs.map(({ question, answer }) => ({ question, answer })));
});

test("the home page names the site and the FAQ page is linked from it", async ({ page }) => {
  await page.goto("/");
  const [site] = ofType(await structuredData(page), "WebSite");
  expect(site).toMatchObject({ name: "BIM Career Academy" });
  await expect(page.getByRole("link", { name: "View All FAQs" })).toHaveAttribute("href", "/faq");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "FAQs", exact: true })).toHaveAttribute("href", "/faq");
  // Every course is one click away from any page.
  const courses = await apiData<Course[]>("GET", "/courses", { auth: false });
  for (const course of courses.slice(0, 6)) {
    await expect(footer.getByRole("link", { name: course.title, exact: true })).toHaveAttribute("href", `/courses/${course.category.slug}/${course.slug}`);
  }
});

test("pages that must stay out of the index are not indexable", async ({ page, audit }) => {
  audit.allow(/→ 404$/);
  audit.allow(/status of 404/);
  for (const path of ["/does-not-exist", "/courses/no-such-category"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  }
  // Syllabus PDFs are downloads: served, but never a search result.
  const courses = await apiData<Course[]>("GET", "/courses", { auth: false });
  const syllabus = await fetch(`${CLIENT_URL}/courses/${courses[0].category.slug}/${courses[0].slug}/syllabus`);
  expect(syllabus.status).toBe(200);
  expect(syllabus.headers.get("x-robots-tag")).toBe("noindex");
});
