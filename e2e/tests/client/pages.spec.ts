import { test, expect } from "../../helpers/fixtures";
import { apiData } from "../../helpers/api";

/**
 * Smoke test for every public page: it loads with the right status, renders
 * its heading inside the site chrome, every image resolves, and the browser
 * console / network log is clean.
 */
const pages: { path: string; h1: string | RegExp; title: RegExp }[] = [
  { path: "/", h1: /Build Your Career/i, title: /BIM Career Academy/ },
  { path: "/about", h1: "About BIM Career Academy", title: /About Us/ },
  { path: "/courses", h1: "Our Courses", title: /Courses/ },
  { path: "/trainers", h1: "Meet Our Expert Trainers", title: /Trainers/ },
  { path: "/projects", h1: "Our Training Portfolio", title: /Projects/ },
  { path: "/faq", h1: "Frequently Asked Questions", title: /FAQ/ },
  { path: "/contact", h1: "Contact Our Academy", title: /Contact/ },
  { path: "/privacy-policy", h1: "Privacy Policy", title: /Privacy Policy/ },
];

for (const p of pages) {
  test(`page ${p.path} renders cleanly`, async ({ page, audit }) => {
    const response = await page.goto(p.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(p.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.locator("main#main")).toBeVisible();

    // Scroll through the page so lazy images load, then make sure none is broken.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");
    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth === 0 && img.getAttribute("src"))
        .map((img) => img.currentSrc || img.src),
    );
    expect(broken, "broken images").toEqual([]);
    expect(audit.problems).toEqual([]);
  });
}

test("category and course pages render for every active category", async ({ page, audit }) => {
  const categories = await apiData<{ slug: string; name: string; courseCount: number }[]>("GET", "/categories", { auth: false });
  expect(categories.length).toBeGreaterThan(0);
  for (const category of categories) {
    const res = await page.goto(`/courses/${category.slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(category.name);
    await expect(page).toHaveTitle(new RegExp(category.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  const courses = await apiData<{ slug: string; title: string; category: { slug: string } }[]>("GET", "/courses", { auth: false });
  const first = courses[0];
  const res = await page.goto(`/courses/${first.category.slug}/${first.slug}`);
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.title);
  expect(audit.problems).toEqual([]);
});

test("unknown URLs return a styled 404 with the site chrome", async ({ page, audit }) => {
  audit.allow(/→ 404$/);
  audit.allow(/status of 404/);
  for (const path of ["/does-not-exist", "/courses/no-such-category", "/courses/bim-digital-construction/no-such-course"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore Courses" })).toHaveAttribute("href", "/courses");
  }
});

test("a course requested under the wrong category is a 404", async ({ page, audit }) => {
  audit.allow(/→ 404$/);
  audit.allow(/status of 404/);
  const courses = await apiData<{ slug: string; category: { slug: string } }[]>("GET", "/courses", { auth: false });
  const course = courses[0];
  const other = courses.find((c) => c.category.slug !== course.category.slug)!;
  const res = await page.goto(`/courses/${other.category.slug}/${course.slug}`);
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
});

test("SEO meta from the API is applied to the page head", async ({ page }) => {
  const pagesMeta = await apiData<{ path: string; metaTitle: string | null; metaDescription: string | null }[]>("GET", "/pages", { auth: false });
  const home = pagesMeta.find((p) => p.path === "/")!;
  await page.goto("/");
  if (home.metaTitle) await expect(page).toHaveTitle(home.metaTitle);
  if (home.metaDescription) await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", home.metaDescription);
  await expect(page.locator("link[rel=icon]").first()).toHaveCount(1);
});
