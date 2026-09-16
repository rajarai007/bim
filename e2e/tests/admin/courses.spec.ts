import { test, expect } from "../../helpers/fixtures";
import { api, apiData, categories, deleteCourseBySlug, uniq, type ApiCourse } from "../../helpers/api";
import { CLIENT_URL } from "../../playwright.config";

type Paginated = { items: ApiCourse[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } };

test.describe("course list", () => {
  test("pagination, search and filters drive the URL and the API query", async ({ page }) => {
    const first = await apiData<Paginated>("GET", "/admin/courses?page=1&pageSize=10");
    await page.goto("/courses");
    await page.waitForLoadState("networkidle");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(Math.min(10, first.pagination.total));
    await expect(page.getByText(`Showing 1 to ${Math.min(10, first.pagination.total)} of ${first.pagination.total} entries`)).toBeVisible();
    await expect(rows.first()).toContainText(first.items[0].title);

    if (first.pagination.totalPages > 1) {
      await page.getByRole("navigation", { name: "Pagination" }).getByRole("button", { name: "Next" }).click();
      await expect(page).toHaveURL(/page=2/);
      const second = await apiData<Paginated>("GET", "/admin/courses?page=2&pageSize=10");
      await expect(rows.first()).toContainText(second.items[0].title);
      await expect(page.getByRole("button", { name: "2", exact: true })).toHaveAttribute("aria-current", "page");
      await page.getByRole("navigation", { name: "Pagination" }).getByRole("button", { name: "Previous" }).click();
      await expect(page).not.toHaveURL(/page=/);
    }

    // Search is debounced and resets pagination.
    await page.getByRole("searchbox", { name: "Search course name" }).fill("revit");
    await expect(page).toHaveURL(/q=revit/);
    const searched = await apiData<Paginated>("GET", "/admin/courses?q=revit&pageSize=10");
    await expect(rows).toHaveCount(searched.items.length);
    for (const c of searched.items) await expect(rows.filter({ has: page.getByRole("link", { name: c.title, exact: true }) })).toHaveCount(1);

    await page.getByRole("searchbox", { name: "Search course name" }).fill("zzz-no-such-course");
    await expect(page.getByText("No courses match the current filters.")).toBeVisible();
    await page.getByRole("searchbox", { name: "Search course name" }).fill("");
    await expect(page).not.toHaveURL(/q=/);

    // Category + status filters.
    const cats = await categories();
    const cat = cats.find((c) => c.courseCount > 0)!;
    await page.getByLabel("Filter by category").selectOption(cat.slug);
    await expect(page).toHaveURL(new RegExp(`category=${cat.slug}`));
    const byCat = await apiData<Paginated>("GET", `/admin/courses?category=${cat.slug}&pageSize=10`);
    await expect(rows).toHaveCount(Math.min(10, byCat.pagination.total));
    await expect(rows.filter({ hasText: cat.name })).toHaveCount(Math.min(10, byCat.pagination.total));
    await page.getByLabel("Filter by status").selectOption("draft");
    await expect(page).toHaveURL(/status=draft/);
    const drafts = await apiData<Paginated>("GET", `/admin/courses?category=${cat.slug}&status=draft&pageSize=10`);
    if (drafts.pagination.total === 0) await expect(page.getByText("No courses match the current filters.")).toBeVisible();
    else await expect(rows).toHaveCount(Math.min(10, drafts.pagination.total));
  });

  test("the featured star toggles the flag in the database", async ({ page }) => {
    const list = await apiData<Paginated>("GET", "/admin/courses?pageSize=1");
    const course = list.items[0];
    await page.goto(`/courses?q=${encodeURIComponent(course.slug)}`);
    const star = page.getByRole("button", { name: new RegExp(`${course.isFeatured ? "Remove" : "Mark"} ${course.title}`) });
    await star.click();
    await expect(page.getByRole("button", { name: new RegExp(`${course.isFeatured ? "Mark" : "Remove"} ${course.title}`) })).toBeVisible();
    expect((await apiData<ApiCourse>("GET", `/admin/courses/${course.id}`)).isFeatured).toBe(!course.isFeatured);
    // restore
    await page.getByRole("button", { name: new RegExp(`${course.isFeatured ? "Mark" : "Remove"} ${course.title}`) }).click();
    await expect(page.getByRole("button", { name: new RegExp(`${course.isFeatured ? "Remove" : "Mark"} ${course.title}`) })).toBeVisible();
    expect((await apiData<ApiCourse>("GET", `/admin/courses/${course.id}`)).isFeatured).toBe(course.isFeatured);
  });
});

test.describe("course editor", () => {
  const slug = uniq("e2e-editor-course");
  const title = `E2E Editor Course ${slug.slice(-6)}`;

  test.afterAll(async () => {
    await deleteCourseBySlug(slug);
    await deleteCourseBySlug(`${slug}-renamed`);
  });

  test("create as draft → publish → edit → delete, verified in the database and on the client", async ({ page, audit }) => {
    const cats = await categories();
    const category = cats.find((c) => c.status === "active")!;

    await page.goto("/courses");
    await page.getByRole("link", { name: "Add New Course" }).click();
    await expect(page).toHaveURL(/\/courses\/new$/);

    // Title auto-generates the slug until the slug is edited manually.
    await page.getByLabel("Course Title *").fill(title);
    await expect(page.getByLabel("Slug (URL Path) *")).toHaveValue(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    await page.getByLabel("Slug (URL Path) *").fill(slug);
    await page.getByLabel("Category *").selectOption(String(category.id));
    await page.getByLabel("Short Description *").fill("Created by the E2E suite.");
    await page.getByLabel("Full Detailed Description").fill("Long description from the E2E suite.");
    await page.getByLabel("Eligibility").fill("Anyone curious");
    await page.getByLabel("Who Should Join").fill("Testers");
    await page.getByLabel("What You Will Learn (One per Line)").fill("Outcome one\nOutcome two");
    await page.getByLabel("Syllabus Modules (JSON or List)").fill("Module 1: Basics - Getting started\nModule 2: Advanced - Going deeper");
    await page.getByLabel("Software Covered (Comma Separated)").fill("Revit, Navisworks");
    await page.getByLabel("Career Opportunities").fill("BIM Tester, QA Modeler");
    await page.getByLabel("Duration").selectOption("8");
    await page.getByLabel("Training Mode").selectOption("Online Live");
    await page.getByLabel("Batch Location").fill("Remote");
    await page.getByLabel("Meta Title").fill("E2E Meta Title");

    await page.getByRole("button", { name: "Save Draft" }).click();
    await expect(page).toHaveURL(/\/courses\/\d+\/edit\?saved=draft$/);
    await expect(page.getByRole("status")).toContainText("Draft saved.");
    await expect(page.getByRole("heading", { level: 1, name: "Edit Course" })).toBeVisible();

    const stored = (await apiData<{ items: ApiCourse[] }>("GET", `/admin/courses?q=${slug}`)).items.find((c) => c.slug === slug)!;
    expect(stored).toBeDefined();
    const detail = await apiData<ApiCourse & { outcomes: string[]; syllabus: { title: string; description: string }[]; software: string[]; careers: string[]; trainingMode: string; batchLocation: string; metaTitle: string }>("GET", `/admin/courses/${stored.id}`);
    expect(detail).toMatchObject({
      status: "draft",
      durationWeeks: 8,
      trainingMode: "Online Live",
      batchLocation: "Remote",
      metaTitle: "E2E Meta Title",
      outcomes: ["Outcome one", "Outcome two"],
      software: ["Revit", "Navisworks"],
      careers: ["BIM Tester", "QA Modeler"],
      syllabus: [
        { title: "Module 1: Basics", description: "Getting started" },
        { title: "Module 2: Advanced", description: "Going deeper" },
      ],
    });

    // Draft is not public.
    audit.allow(/→ 404$/);
    audit.allow(/status of 404/);
    expect((await api("GET", `/courses/${slug}`, { auth: false })).status).toBe(404);

    // Publish from the editor: a draft keeps the Active switch on so "Publish" really publishes.
    await expect(page.getByRole("switch", { name: "Active status" })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Publish Course" }).click();
    await expect(page).toHaveURL(/saved=published$/);
    await expect(page.getByRole("status")).toContainText("Course published.");
    expect((await apiData<ApiCourse>("GET", `/admin/courses/${stored.id}`)).status).toBe("active");
    expect((await api("GET", `/courses/${slug}`, { auth: false })).status).toBe(200);

    // The client renders it live.
    await page.goto(`${CLIENT_URL}/courses/${category.slug}/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText("Outcome one")).toBeVisible();
    await expect(page.getByText("Module 1: Basics")).toBeVisible();

    // Edit: rename + featured, then inactive.
    await page.goto(`/courses/${stored.id}/edit`);
    await page.getByLabel("Course Title *").fill(`${title} Renamed`);
    await page.getByRole("switch", { name: "Featured course" }).click();
    await page.getByRole("button", { name: "Publish Course" }).click();
    await expect(page.getByRole("status")).toContainText("Course published.");
    const renamed = await apiData<ApiCourse>("GET", `/admin/courses/${stored.id}`);
    expect(renamed).toMatchObject({ title: `${title} Renamed`, isFeatured: true, status: "active" });

    await page.getByRole("switch", { name: "Active status" }).click();
    await page.getByRole("button", { name: "Publish Course" }).click();
    await expect(page.getByRole("status")).toContainText("Course saved.");
    expect((await apiData<ApiCourse>("GET", `/admin/courses/${stored.id}`)).status).toBe("inactive");

    // Delete from the list (confirm dialog).
    await page.goto(`/courses?q=${slug}`);
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: `Delete ${title} Renamed` }).click();
    await expect(page.getByRole("status")).toContainText("Course deleted.");
    await expect(page.getByText("No courses match the current filters.")).toBeVisible();
    expect((await api("GET", `/admin/courses/${stored.id}`)).status).toBe(404);
  });

  test("cancelling the delete confirmation keeps the course", async ({ page }) => {
    const list = await apiData<Paginated>("GET", "/admin/courses?pageSize=1");
    const course = list.items[0];
    await page.goto(`/courses?q=${encodeURIComponent(course.slug)}`);
    page.once("dialog", (d) => d.dismiss());
    await page.getByRole("button", { name: `Delete ${course.title}` }).click();
    await page.waitForTimeout(500);
    await expect(page.locator("tbody tr").filter({ hasText: course.title })).toHaveCount(1);
    expect((await api("GET", `/admin/courses/${course.id}`)).status).toBe(200);
  });

  test("server-side validation errors are shown on the fields (duplicate slug, bad syllabus)", async ({ page }) => {
    const existing = (await apiData<Paginated>("GET", "/admin/courses?pageSize=1")).items[0];
    await page.goto("/courses/new");
    await page.getByLabel("Course Title *").fill("E2E Duplicate");
    await page.getByLabel("Slug (URL Path) *").fill(existing.slug);
    await page.getByLabel("Short Description *").fill("dup");
    await page.getByLabel("Eligibility").fill("x");
    await page.getByLabel("Full Detailed Description").fill("Typed before the error");
    await page.getByRole("button", { name: "Publish Course" }).click();
    await expect(page.getByText("Must be unique")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("already exists");
    await expect(page).toHaveURL(/\/courses\/new$/);
    // A server-side error must not wipe what the admin typed.
    await expect(page.getByLabel("Short Description *")).toHaveValue("dup");
    await expect(page.getByLabel("Full Detailed Description")).toHaveValue("Typed before the error");
    await expect(page.getByLabel("Eligibility")).toHaveValue("x");

    await page.getByLabel("Slug (URL Path) *").fill("Bad Slug!");
    await page.getByRole("button", { name: "Publish Course" }).click();
    await expect(page.getByText(/Slug may only contain/)).toBeVisible();

    await page.getByLabel("Slug (URL Path) *").fill(uniq("e2e-bad-syllabus"));
    await page.getByLabel("Syllabus Modules (JSON or List)").fill("[{ not json");
    await page.getByRole("button", { name: "Publish Course" }).click();
    await expect(page.getByText(/Invalid syllabus/)).toBeVisible();
    await expect(page).toHaveURL(/\/courses\/new$/);
  });

  test("required fields are enforced before submission", async ({ page }) => {
    await page.goto("/courses/new");
    await page.getByRole("button", { name: "Publish Course" }).click();
    await expect(page).toHaveURL(/\/courses\/new$/);
    expect(await page.getByLabel("Course Title *").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
  });

  test("a duration outside the preset list is preserved when editing", async ({ page }) => {
    const cats = await categories();
    const slug = uniq("e2e-odd-duration");
    const created = await apiData<ApiCourse>("POST", "/admin/courses", {
      body: { categoryId: cats[0].id, slug, title: "Odd Duration", shortDescription: "s", durationWeeks: 5, status: "draft" },
    });
    try {
      await page.goto(`/courses/${created.id}/edit`);
      await expect(page.getByLabel("Duration")).toHaveValue("5");
      await expect(page.getByLabel("Duration").locator("option[value='5']")).toHaveText("5 Weeks (1.3 Months)");
      await page.getByLabel("Course Title *").fill("Odd Duration Saved");
      await page.getByRole("button", { name: "Save Draft" }).click();
      await expect(page.getByRole("status")).toContainText("Draft saved.");
      expect((await apiData<ApiCourse>("GET", `/admin/courses/${created.id}`)).durationWeeks).toBe(5);
    } finally {
      await api("DELETE", `/admin/courses/${created.id}`);
    }
  });

  test("editing a course shows its current values", async ({ page }) => {
    const course = (await apiData<Paginated>("GET", "/admin/courses?pageSize=1")).items[0];
    const detail = await apiData<ApiCourse & { shortDescription: string; trainingMode: string }>("GET", `/admin/courses/${course.id}`);
    await page.goto("/courses");
    await page.getByRole("link", { name: `Edit ${course.title}` }).click();
    await expect(page).toHaveURL(new RegExp(`/courses/${course.id}/edit$`));
    await expect(page.getByLabel("Course Title *")).toHaveValue(course.title);
    await expect(page.getByLabel("Slug (URL Path) *")).toHaveValue(course.slug);
    await expect(page.getByLabel("Short Description *")).toHaveValue(detail.shortDescription);
    await expect(page.getByLabel("Category *")).toHaveValue(String(course.categoryId));
    await expect(page.getByLabel("Duration")).toHaveValue(String(course.durationWeeks));
    await expect(page.getByLabel("Training Mode")).toHaveValue(detail.trainingMode);
    await expect(page.getByRole("switch", { name: "Active status" })).toHaveAttribute("aria-checked", String(course.status !== "inactive"));
    await expect(page.getByRole("switch", { name: "Featured course" })).toHaveAttribute("aria-checked", String(course.isFeatured));
    await page.getByRole("link", { name: "Back to Course List" }).click();
    await expect(page).toHaveURL(/\/courses$/);
  });
});
