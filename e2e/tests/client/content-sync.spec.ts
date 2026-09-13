import { test, expect } from "../../helpers/fixtures";
import { api, apiData, categories, deleteCourseBySlug, uniq, type ApiCourse } from "../../helpers/api";

/**
 * Admin → API → database → client. Records are changed through the admin API
 * (the admin UI flows are covered in the admin project) and the public site is
 * checked to render the change immediately.
 */
test.describe("content managed by the admin is live on the client", () => {
  test("a new active course appears on its category page, a draft disappears, a deleted one is gone", async ({ page, audit }) => {
    const cats = await categories();
    const category = cats.find((c) => c.status === "active")!;
    const slug = uniq("e2e-sync-course");
    const title = `E2E Sync Course ${slug.slice(-6)}`;
    try {
      const created = await apiData<ApiCourse>("POST", "/admin/courses", {
        body: { categoryId: category.id, slug, title, shortDescription: "Synced from the admin API", durationWeeks: 8, status: "active", outcomes: ["Sync outcome"], syllabus: [{ title: "Sync module", description: "desc" }] },
      });

      await page.goto(`/courses/${category.slug}`);
      await expect(page.getByRole("link", { name: new RegExp(title) }).first()).toHaveAttribute("href", `/courses/${category.slug}/${slug}`);
      await page.goto(`/courses/${category.slug}/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.getByText("Sync outcome")).toBeVisible();

      // Edit: title change + draft status hides it.
      await apiData("PUT", `/admin/courses/${created.id}`, { body: { ...created, title: `${title} v2`, status: "active" } });
      await page.goto(`/courses/${category.slug}/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${title} v2`);

      await apiData("PUT", `/admin/courses/${created.id}`, { body: { ...created, status: "draft" } });
      audit.allow(/→ 404$/);
      audit.allow(/status of 404/);
      const draft = await page.goto(`/courses/${category.slug}/${slug}`);
      expect(draft?.status()).toBe(404);
      await page.goto(`/courses/${category.slug}`);
      await expect(page.getByRole("link", { name: new RegExp(title) })).toHaveCount(0);

      // Featured → shows on home.
      await apiData("PUT", `/admin/courses/${created.id}`, { body: { ...created, status: "active", isFeatured: true } });
      await page.goto("/");
      await expect(page.getByRole("link", { name: new RegExp(title) }).first()).toBeVisible();
      await apiData("PATCH", `/admin/courses/${created.id}/featured`, { body: { isFeatured: false } });
      await page.goto("/");
      await expect(page.getByRole("link", { name: new RegExp(title) })).toHaveCount(0);

      // Delete → gone.
      await apiData("DELETE", `/admin/courses/${created.id}`);
      const gone = await page.goto(`/courses/${category.slug}/${slug}`);
      expect(gone?.status()).toBe(404);
    } finally {
      await deleteCourseBySlug(slug);
    }
  });

  test("site settings changes are reflected in the header, footer and contact page", async ({ page }) => {
    const original = await apiData<{ phone: string; email: string; address: string; instagramUrl: string | null }>("GET", "/admin/settings");
    const phone = "+91 99999 12345";
    const email = "e2e-sync@bimcareeracademy.com";
    try {
      await apiData("PATCH", "/admin/settings", { body: { phone, email, instagramUrl: null } });
      await page.goto("/contact");
      await expect(page.getByRole("contentinfo")).toContainText(phone);
      await expect(page.getByRole("contentinfo").getByRole("link", { name: new RegExp(email) })).toHaveAttribute("href", `mailto:${email}`);
      await expect(page.getByRole("banner").getByRole("link", { name: /Call/ })).toHaveAttribute("href", "tel:+919999912345");
      await expect(page.getByRole("contentinfo").getByRole("link", { name: "Instagram", exact: true })).toHaveCount(0);
      await expect(page.getByRole("main")).toContainText(phone);
    } finally {
      await apiData("PATCH", "/admin/settings", { body: { phone: original.phone, email: original.email, instagramUrl: original.instagramUrl } });
    }
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toContainText(original.phone);
  });

  test("SEO meta edited in the admin changes the client page head", async ({ page }) => {
    const pages = await apiData<{ id: number; path: string; metaTitle: string | null; metaDescription: string | null }[]>("GET", "/admin/pages");
    const about = pages.find((p) => p.path === "/about")!;
    try {
      await apiData("PATCH", `/admin/pages/${about.id}`, { body: { metaTitle: "E2E About Title", metaDescription: "E2E about description" } });
      await page.goto("/about");
      await expect(page).toHaveTitle("E2E About Title");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "E2E about description");
    } finally {
      await apiData("PATCH", `/admin/pages/${about.id}`, { body: { metaTitle: about.metaTitle, metaDescription: about.metaDescription } });
    }
  });

  test("Google Analytics tag is injected only when a measurement id is configured", async ({ page, audit }) => {
    const original = await apiData<{ gaMeasurementId: string | null }>("GET", "/admin/settings");
    try {
      await apiData("PATCH", "/admin/settings", { body: { gaMeasurementId: "G-E2ETEST123" } });
      // The tag manager script is external; block it so the test stays offline.
      await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({ status: 200, body: "", contentType: "application/javascript" }));
      await page.goto("/");
      await expect(page.locator('script[src*="googletagmanager.com/gtag/js?id=G-E2ETEST123"]')).toHaveCount(1);
      await expect(page.locator("script#ga-init")).toHaveCount(1);
      await apiData("PATCH", "/admin/settings", { body: { gaMeasurementId: null } });
      await page.goto("/");
      await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
    } finally {
      await apiData("PATCH", "/admin/settings", { body: { gaMeasurementId: original.gaMeasurementId } });
    }
    void audit;
  });

  test("inactive category and its courses vanish from the site", async ({ page, audit }) => {
    const cats = await categories();
    const category = cats.find((c) => c.status === "active" && c.courseCount > 0)!;
    const full = await apiData<Record<string, unknown>>("GET", `/admin/categories/${category.id}`);
    const courses = await apiData<{ slug: string }[]>("GET", `/courses?category=${category.slug}`, { auth: false });
    audit.allow(/→ 404$/);
    audit.allow(/status of 404/);
    try {
      await apiData("PUT", `/admin/categories/${category.id}`, { body: { ...full, status: "inactive" } });
      expect((await page.goto(`/courses/${category.slug}`))?.status()).toBe(404);
      expect((await page.goto(`/courses/${category.slug}/${courses[0].slug}`))?.status()).toBe(404);
      await page.goto("/courses");
      await expect(page.getByRole("link", { name: `View All ${category.badge} Courses` })).toHaveCount(0);
      await expect(page.getByRole("contentinfo").getByRole("link", { name: String(full.footerLabel), exact: true })).toHaveCount(0);
    } finally {
      await api("PUT", `/admin/categories/${category.id}`, { body: { ...full, status: "active" } });
    }
    expect((await page.goto(`/courses/${category.slug}`))?.status()).toBe(200);
  });
});
