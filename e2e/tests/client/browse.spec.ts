import { test, expect } from "../../helpers/fixtures";
import { apiData } from "../../helpers/api";

test.describe("FAQ page", () => {
  test("category tabs filter the accordion and questions toggle", async ({ page }) => {
    const [categories, faqs] = await Promise.all([
      apiData<{ id: number; slug: string; label: string }[]>("GET", "/faq-categories", { auth: false }),
      apiData<{ id: number; question: string; category: { slug: string } }[]>("GET", "/faqs", { auth: false }),
    ]);
    await page.goto("/faq");
    const tabs = page.getByRole("tablist", { name: "FAQ categories" }).getByRole("tab");
    await expect(tabs).toHaveCount(categories.length);
    const panel = page.getByRole("tabpanel");
    const questions = panel.locator("h3 button[aria-expanded]");

    // First tab (General Queries) shows every published question, first three expanded.
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    await expect(questions).toHaveCount(faqs.length);
    for (let i = 0; i < Math.min(3, faqs.length); i++) await expect(questions.nth(i)).toHaveAttribute("aria-expanded", "true");
    if (faqs.length > 3) await expect(questions.nth(3)).toHaveAttribute("aria-expanded", "false");

    // Toggle a question closed and open again.
    await questions.first().click();
    await expect(questions.first()).toHaveAttribute("aria-expanded", "false");
    await questions.first().click();
    await expect(questions.first()).toHaveAttribute("aria-expanded", "true");

    // Every other tab filters to its own questions (or shows the empty state).
    for (const category of categories.slice(1)) {
      await tabs.filter({ hasText: category.label }).click();
      await expect(tabs.filter({ hasText: category.label })).toHaveAttribute("aria-selected", "true");
      const expected = faqs.filter((f) => f.category.slug === category.slug);
      if (expected.length) {
        await expect(questions).toHaveCount(expected.length);
        for (const f of expected) await expect(panel.getByRole("button", { name: f.question })).toBeVisible();
      } else {
        await expect(panel).toContainText("No questions in this category yet.");
      }
    }
  });
});

test.describe("Projects page", () => {
  test("filter pills narrow the grid by category", async ({ page }) => {
    const [categories, projects] = await Promise.all([
      apiData<{ slug: string; badge: string }[]>("GET", "/categories", { auth: false }),
      apiData<{ id: number; title: string; category: { slug: string } }[]>("GET", "/projects", { auth: false }),
    ]);
    await page.goto("/projects");
    const tabs = page.getByRole("tablist", { name: /Filter projects/ }).getByRole("tab");
    await expect(tabs).toHaveCount(categories.length + 1);
    const grid = page.getByRole("tabpanel");
    const cards = grid.locator("article, [data-project], h3");
    await expect(grid.getByRole("heading", { level: 3 })).toHaveCount(projects.length);
    for (const c of categories) {
      await tabs.filter({ hasText: c.badge }).click();
      const expected = projects.filter((p) => p.category.slug === c.slug);
      if (expected.length) {
        await expect(grid.getByRole("heading", { level: 3 })).toHaveCount(expected.length);
        for (const p of expected) await expect(grid.getByRole("heading", { level: 3, name: p.title })).toBeVisible();
      } else {
        await expect(grid).toContainText("No projects in this category yet.");
      }
    }
    await tabs.first().click();
    await expect(grid.getByRole("heading", { level: 3 })).toHaveCount(projects.length);
    void cards;
  });
});

test.describe("Trainers page", () => {
  test("lists every active trainer with experience and LinkedIn link", async ({ page }) => {
    const trainers = await apiData<{ id: number; name: string; role: string; experience: string; linkedin: string | null; tags: string[] }[]>("GET", "/trainers", { auth: false });
    await page.goto("/trainers");
    for (const t of trainers) {
      await expect(page.getByRole("heading", { level: 3, name: t.name })).toBeVisible();
      await expect(page.getByText(t.experience).first()).toBeVisible();
      const link = page.getByRole("link", { name: `${t.name} on LinkedIn` });
      if (t.linkedin) {
        await expect(link).toHaveAttribute("href", t.linkedin);
        await expect(link).toHaveAttribute("target", "_blank");
      } else {
        await expect(link).toHaveCount(0);
      }
    }
  });
});

test.describe("home page sections", () => {
  test("testimonials, trainers, projects and FAQ preview reflect the API", async ({ page }) => {
    const [testimonials, trainers, projects, faqs] = await Promise.all([
      apiData<{ id: number; name: string; quote: string; rating: number }[]>("GET", "/testimonials", { auth: false }),
      apiData<{ id: number; name: string }[]>("GET", "/trainers?home=true", { auth: false }),
      apiData<{ id: number; title: string }[]>("GET", "/projects?home=true", { auth: false }),
      apiData<{ id: number; question: string }[]>("GET", "/faqs?home=true", { auth: false }),
    ]);
    await page.goto("/");
    for (const t of testimonials) {
      await expect(page.getByText(t.quote.slice(0, 40)).first()).toBeVisible();
      await expect(page.getByRole("img", { name: `${t.rating} out of 5 stars from ${t.name}` })).toBeVisible();
    }
    for (const t of trainers) await expect(page.getByRole("heading", { name: t.name })).toBeVisible();
    for (const p of projects) await expect(page.getByRole("heading", { name: p.title })).toBeVisible();
    for (const f of faqs) await expect(page.getByRole("button", { name: f.question })).toBeVisible();
  });
});
