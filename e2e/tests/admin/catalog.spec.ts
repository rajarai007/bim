import { test, expect } from "../../helpers/fixtures";
import type { Page } from "@playwright/test";
import { api, apiData, categories, uniq } from "../../helpers/api";
import { CLIENT_URL } from "../../playwright.config";

/**
 * The five catalogue screens share the same table + dialog pattern. Each test
 * runs the full create → verify (API + client) → edit → delete cycle through
 * the UI and cleans up whatever it created.
 */

async function acceptNextDialog(page: Page) {
  page.once("dialog", (d) => d.accept());
}

async function cleanup(entity: string, match: (item: { id: number; [k: string]: unknown }) => boolean) {
  const items = await apiData<{ id: number }[]>("GET", `/admin/${entity}`);
  for (const item of items.filter(match)) await api("DELETE", `/admin/${entity}/${item.id}`);
}

test.describe("categories", () => {
  const slug = uniq("e2e-cat");
  test.afterAll(() => cleanup("categories", (c) => String(c.slug).startsWith("e2e-cat")));

  test("create, search, edit, delete; deleting a category with courses is refused", async ({ page, audit }) => {
    await page.goto("/categories");
    const before = await categories();
    await expect(page.locator("tbody tr")).toHaveCount(before.length);
    for (const c of before) await expect(page.locator("tbody tr").filter({ hasText: c.name }).first()).toContainText(String(c.courseCount));

    await page.getByRole("button", { name: "Add Category" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Category" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Category Name *").fill("E2E Category");
    await dialog.getByLabel("Slug (URL Path) *").fill(slug);
    await dialog.getByLabel("Badge Label *").fill("E2E");
    await dialog.getByLabel("Icon").selectOption("compass");
    await dialog.getByLabel("Homepage Summary *").fill("Summary");
    await dialog.getByLabel("Tagline *").fill("Tagline");
    await dialog.getByLabel("Description *").fill("Description");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("status").filter({ hasText: "Created successfully." })).toBeVisible();
    const row = page.locator("tbody tr").filter({ hasText: "E2E Category" });
    await expect(row).toContainText(`/courses/${slug}`);
    await expect(row).toContainText("Active");

    const created = (await categories()).find((c) => c.slug === slug)!;
    expect(created).toMatchObject({ name: "E2E Category", badge: "E2E", status: "active" });
    expect(await apiData<{ icon: string; footerLabel: string; overviewTitle: string }>("GET", `/admin/categories/${created.id}`)).toMatchObject({ icon: "compass", footerLabel: "E2E Category", overviewTitle: "E2E Category" });

    // Client footer shows the new category immediately.
    await page.goto(`${CLIENT_URL}/courses/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E Category");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "E2E Category", exact: true })).toHaveAttribute("href", `/courses/${slug}`);

    // Duplicate slug is refused with a field error.
    await page.goto("/categories");
    await page.getByRole("button", { name: "Add Category" }).click();
    const dup = page.getByRole("dialog", { name: "Add Category" });
    await dup.getByLabel("Category Name *").fill("Dup");
    await dup.getByLabel("Slug (URL Path) *").fill(slug);
    await dup.getByLabel("Badge Label *").fill("D");
    await dup.getByLabel("Homepage Summary *").fill("s");
    await dup.getByLabel("Tagline *").fill("t");
    await dup.getByLabel("Description *").fill("d");
    await dup.getByRole("button", { name: "Create" }).click();
    await expect(dup.getByText("Must be unique")).toBeVisible();
    await dup.getByRole("button", { name: "Cancel" }).click();
    await expect(dup).toBeHidden();

    // Search filters client-side.
    await page.getByRole("searchbox", { name: "Search category..." }).fill("e2e cat");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.getByRole("searchbox", { name: "Search category..." }).fill("zzz");
    await expect(page.getByText("No categories match your search.")).toBeVisible();
    await page.getByRole("searchbox", { name: "Search category..." }).fill("");

    // Edit → inactive.
    await page.getByRole("button", { name: "Edit E2E Category" }).click();
    const edit = page.getByRole("dialog", { name: "Edit Category" });
    await expect(edit.getByLabel("Slug (URL Path) *")).toHaveValue(slug);
    await edit.getByLabel("Category Name *").fill("E2E Category Renamed");
    await edit.getByLabel("Active").uncheck();
    await edit.getByRole("button", { name: "Save Changes" }).click();
    await expect(edit).toBeHidden();
    await expect(page.getByRole("status").filter({ hasText: "Changes saved." })).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: "E2E Category Renamed" })).toContainText("Inactive");
    expect((await categories()).find((c) => c.id === created.id)).toMatchObject({ name: "E2E Category Renamed", status: "inactive" });
    audit.allow(/→ 404$/);
    audit.allow(/status of 404/);
    expect((await api("GET", `/categories/${slug}`, { auth: false })).status).toBe(404);

    // Refuse deleting a category that still has courses.
    const withCourses = before.find((c) => c.courseCount > 0)!;
    await acceptNextDialog(page);
    await page.getByRole("button", { name: `Delete ${withCourses.name}` }).click();
    await expect(page.getByRole("status").filter({ hasText: /Cannot delete/ })).toBeVisible();
    expect((await api("GET", `/admin/categories/${withCourses.id}`)).status).toBe(200);

    // Delete the empty one.
    await acceptNextDialog(page);
    await page.getByRole("button", { name: "Delete E2E Category Renamed" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Deleted." })).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: "E2E Category Renamed" })).toHaveCount(0);
    expect((await api("GET", `/admin/categories/${created.id}`)).status).toBe(404);
  });
});

test.describe("trainers", () => {
  const name = uniq("E2E Trainer");
  test.afterAll(() => cleanup("trainers", (t) => String(t.name).startsWith("E2E Trainer")));

  test("create with photo, verify on client, edit, delete", async ({ page }) => {
    await page.goto("/trainers");
    await page.getByRole("button", { name: "Add Trainer" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Trainer" });
    await dialog.getByLabel("Full Name *").fill(name);
    await dialog.getByLabel("Role *").fill("E2E Instructor");
    await dialog.getByLabel("Homepage Role").fill("E2E Lead");
    await dialog.getByLabel("Specialization").fill("Testing");
    await dialog.getByLabel("Bio *").fill("Bio text");
    await dialog.getByLabel("Years of Experience *").fill("7");
    await dialog.getByLabel("Expertise Tags (Comma Separated)").fill("Revit, QA");
    await dialog.getByLabel("LinkedIn URL").fill("https://linkedin.com/in/e2e");
    await dialog.getByLabel("Show on Homepage").check();
    // Upload a photo through the dialog's image picker.
    await dialog.locator('input[type="file"]').setInputFiles("/Users/raja/Desktop/BIM/Backend/assets/images/person-02.png");
    await expect(dialog.getByRole("button", { name: "Remove image" })).toBeVisible();
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("status").filter({ hasText: "Created successfully." })).toBeVisible();
    const row = page.locator("tbody tr").filter({ hasText: name });
    await expect(row).toContainText("7+ Years");
    await expect(row).toContainText("HOME");
    await expect(row).toContainText("Revit");

    const created = (await apiData<{ id: number; name: string; imageUrl: string | null; tags: string[]; showOnHome: boolean }[]>("GET", "/admin/trainers")).find((t) => t.name === name)!;
    expect(created.tags).toEqual(["Revit", "QA"]);
    expect(created.showOnHome).toBe(true);
    expect(created.imageUrl).toMatch(/^\/uploads\//);

    await page.goto(`${CLIENT_URL}/trainers`);
    await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
    await expect(page.getByRole("link", { name: `${name} on LinkedIn` })).toHaveAttribute("href", "https://linkedin.com/in/e2e");
    await page.goto(`${CLIENT_URL}/`);
    await expect(page.getByRole("heading", { name })).toBeVisible();

    await page.goto("/trainers");
    await page.getByRole("button", { name: `Edit ${name}` }).click();
    const edit = page.getByRole("dialog", { name: "Edit Trainer" });
    await expect(edit.getByLabel("Years of Experience *")).toHaveValue("7");
    await edit.getByLabel("Years of Experience *").fill("-1");
    await edit.getByRole("button", { name: "Save Changes" }).click();
    // HTML min=0 blocks it client-side; the dialog stays open.
    await expect(edit).toBeVisible();
    await edit.getByLabel("Years of Experience *").fill("9");
    await edit.getByLabel("Active").uncheck();
    await edit.getByRole("button", { name: "Save Changes" }).click();
    await expect(edit).toBeHidden();
    await expect(page.locator("tbody tr").filter({ hasText: name })).toContainText("9+ Years");
    await expect(page.locator("tbody tr").filter({ hasText: name })).toContainText("Inactive");
    await page.goto(`${CLIENT_URL}/trainers`);
    await expect(page.getByRole("heading", { level: 3, name })).toHaveCount(0);

    await page.goto("/trainers");
    await acceptNextDialog(page);
    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.getByRole("status").filter({ hasText: "Deleted." })).toBeVisible();
    expect((await api("GET", `/admin/trainers/${created.id}`)).status).toBe(404);
    // The uploaded photo is now unused and can be removed from the library.
    const media = (await apiData<{ id: number; url: string; usageCount: number }[]>("GET", "/admin/media")).find((m) => m.url === created.imageUrl)!;
    expect(media.usageCount).toBe(0);
    await api("DELETE", `/admin/media/${media.id}`);
  });
});

test.describe("testimonials", () => {
  const name = uniq("E2E Student");
  test.afterAll(() => cleanup("testimonials", (t) => String(t.name).startsWith("E2E Student")));

  test("pending testimonials stay hidden until published", async ({ page }) => {
    await page.goto("/testimonials");
    await page.getByRole("button", { name: "Add Testimonial" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Testimonial" });
    await dialog.getByLabel("Student Name *").fill(name);
    await dialog.getByLabel("Program *").fill("E2E Program");
    await dialog.getByLabel("Quote *").fill("The E2E suite was excellent.");
    await dialog.getByLabel("Rating (1–5) *").selectOption("4");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();
    const row = page.locator("tbody tr").filter({ hasText: name });
    await expect(row).toContainText("Pending");
    await expect(row.getByLabel("4 out of 5 stars")).toBeVisible();

    const pub = await apiData<{ name: string }[]>("GET", "/testimonials", { auth: false });
    expect(pub.some((t) => t.name === name)).toBe(false);

    await page.getByRole("button", { name: `Edit testimonial by ${name}` }).click();
    const edit = page.getByRole("dialog", { name: "Edit Testimonial" });
    await expect(edit.getByLabel("Rating (1–5) *")).toHaveValue("4");
    await edit.getByLabel("Published").check();
    await edit.getByRole("button", { name: "Save Changes" }).click();
    await expect(edit).toBeHidden();
    await expect(page.locator("tbody tr").filter({ hasText: name })).toContainText("Published");
    await page.goto(`${CLIENT_URL}/`);
    await expect(page.getByText("The E2E suite was excellent.")).toBeVisible();

    await page.goto("/testimonials");
    await acceptNextDialog(page);
    await page.getByRole("button", { name: `Delete testimonial by ${name}` }).click();
    await expect(page.getByRole("status").filter({ hasText: "Deleted." })).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: name })).toHaveCount(0);
  });
});

test.describe("projects", () => {
  const title = uniq("E2E Project");
  test.afterAll(() => cleanup("projects", (p) => String(p.title).startsWith("E2E Project")));

  test("create draft → publish + show on home → client showcase → delete", async ({ page }) => {
    const cats = await categories();
    const category = cats.find((c) => c.status === "active")!;
    await page.goto("/projects");
    await page.getByRole("button", { name: "Add Project" }).click();
    const dialog = page.getByRole("dialog", { name: "Add Project" });
    await dialog.getByLabel("Project Title *").fill(title);
    await dialog.getByLabel("Category *").selectOption(String(category.id));
    await dialog.getByLabel("Description *").fill("Project description");
    await dialog.getByLabel("Software Used (Comma Separated)").fill("Lumion, Revit");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();
    const row = page.locator("tbody tr").filter({ hasText: title });
    await expect(row).toContainText("Draft");
    await expect(row).toContainText(category.badge);
    await expect(row).toContainText("Lumion");
    expect((await apiData<{ title: string }[]>("GET", "/projects", { auth: false })).some((p) => p.title === title)).toBe(false);

    await page.getByRole("button", { name: `Edit ${title}` }).click();
    const edit = page.getByRole("dialog", { name: "Edit Project" });
    await edit.getByLabel("Published").check();
    await edit.getByLabel("Show on Homepage").check();
    await edit.getByRole("button", { name: "Save Changes" }).click();
    await expect(edit).toBeHidden();
    await expect(page.locator("tbody tr").filter({ hasText: title })).toContainText("HOME");
    await page.goto(`${CLIENT_URL}/projects`);
    await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
    await page.getByRole("tab", { name: category.badge }).click();
    await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
    await page.goto(`${CLIENT_URL}/`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.goto("/projects");
    await acceptNextDialog(page);
    await page.getByRole("button", { name: `Delete ${title}` }).click();
    await expect(page.getByRole("status").filter({ hasText: "Deleted." })).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: title })).toHaveCount(0);
  });
});

test.describe("faqs", () => {
  const question = `${uniq("E2E question")}?`;
  test.afterAll(() => cleanup("faqs", (f) => String(f.question).startsWith("E2E question")));

  test("create draft → publish + homepage → client FAQ page and preview → delete", async ({ page }) => {
    const faqCategories = await apiData<{ id: number; slug: string; label: string }[]>("GET", "/faq-categories", { auth: false });
    const target = faqCategories[1] ?? faqCategories[0];
    await page.goto("/faqs");
    await page.getByRole("button", { name: "Add FAQ" }).click();
    const dialog = page.getByRole("dialog", { name: "Add FAQ" });
    await dialog.getByLabel("Question *").fill(question);
    await dialog.getByLabel("Answer *").fill("Because the suite checks it.");
    await dialog.getByLabel("Category *").selectOption(String(target.id));
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();
    const row = page.locator("tbody tr").filter({ hasText: question });
    await expect(row).toContainText(target.label);
    await expect(row).toContainText("Draft");
    expect((await apiData<{ question: string }[]>("GET", "/faqs", { auth: false })).some((f) => f.question === question)).toBe(false);

    await page.getByRole("searchbox", { name: "Search question..." }).fill("E2E question");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.getByRole("button", { name: `Edit ${question}` }).click();
    const edit = page.getByRole("dialog", { name: "Edit FAQ" });
    await edit.getByLabel("Published").check();
    await edit.getByLabel("Show on Homepage").check();
    await edit.getByRole("button", { name: "Save Changes" }).click();
    await expect(edit).toBeHidden();
    await expect(page.locator("tbody tr").filter({ hasText: question })).toContainText("Yes");

    await page.goto(`${CLIENT_URL}/faq`);
    await expect(page.getByRole("button", { name: question })).toBeVisible();
    await page.getByRole("tab", { name: target.label }).click();
    await expect(page.getByRole("button", { name: question })).toBeVisible();
    await page.goto(`${CLIENT_URL}/`);
    await expect(page.getByRole("button", { name: question })).toBeVisible();

    await page.goto("/faqs");
    await acceptNextDialog(page);
    await page.getByRole("button", { name: `Delete ${question}` }).click();
    await expect(page.getByRole("status").filter({ hasText: "Deleted." })).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: question })).toHaveCount(0);
  });
});

test("dialogs close on Escape and Cancel without saving", async ({ page }) => {
  await page.goto("/faqs");
  const before = (await apiData<unknown[]>("GET", "/admin/faqs")).length;
  await page.getByRole("button", { name: "Add FAQ" }).click();
  const dialog = page.getByRole("dialog", { name: "Add FAQ" });
  await dialog.getByLabel("Question *").fill("Escape me?");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Add FAQ" }).click();
  await page.getByRole("dialog", { name: "Add FAQ" }).getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await apiData<unknown[]>("GET", "/admin/faqs")).length).toBe(before);
});
