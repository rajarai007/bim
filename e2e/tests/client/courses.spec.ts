import { test, expect } from "../../helpers/fixtures";
import { apiData } from "../../helpers/api";

type PublicCourse = { id: number; slug: string; title: string; duration: string; featured: boolean; category: { slug: string; name: string; badge: string } };
type PublicCategory = { id: number; slug: string; name: string; badge: string; overviewTitle: string; courseCount: number };
type CourseDetail = PublicCourse & {
  detail: { heroTitle: string; meta: { duration: string; mode: string; admissions: string }; outcomes: string[]; modules: { title: string; description: string }[]; software: string[]; careers: string[]; whoShouldJoin: string; eligibility: string };
  related: PublicCourse[];
};

test("courses overview lists every category with up to five courses and a view-all link", async ({ page }) => {
  const [categories, courses] = await Promise.all([
    apiData<PublicCategory[]>("GET", "/categories", { auth: false }),
    apiData<PublicCourse[]>("GET", "/courses", { auth: false }),
  ]);
  await page.goto("/courses");
  for (const category of categories) {
    const inCategory = courses.filter((c) => c.category.slug === category.slug);
    if (!inCategory.length) continue;
    const section = page.locator("section", { has: page.getByRole("heading", { level: 2, name: category.overviewTitle }) });
    await expect(section).toBeVisible();
    for (const course of inCategory.slice(0, 5)) {
      await expect(section.getByRole("link", { name: new RegExp(course.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).first()).toHaveAttribute("href", `/courses/${category.slug}/${course.slug}`);
    }
    await expect(section.getByRole("link", { name: `View All ${category.badge} Courses` })).toHaveAttribute("href", `/courses/${category.slug}`);
  }
});

test("category page shows every active course of the category and its featured programs", async ({ page }) => {
  const categories = await apiData<PublicCategory[]>("GET", "/categories", { auth: false });
  const category = categories.find((c) => c.courseCount > 0)!;
  const courses = await apiData<PublicCourse[]>("GET", `/courses?category=${category.slug}`, { auth: false });
  await page.goto(`/courses/${category.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(category.name);
  await expect(page.getByRole("heading", { level: 2, name: `All ${category.badge} Courses` })).toBeVisible();
  for (const course of courses) {
    const links = page.getByRole("link", { name: new RegExp(`^${course.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
    await expect(links.first()).toHaveAttribute("href", `/courses/${category.slug}/${course.slug}`);
  }
  const featured = courses.filter((c) => c.featured);
  if (featured.length) {
    await expect(page.getByRole("heading", { level: 2, name: "Featured Programs" })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { level: 2, name: "Featured Programs" })).toHaveCount(0);
  }
  // Clicking a card reaches the detail page.
  await page.getByRole("link", { name: new RegExp(`^${courses[0].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) }).first().click();
  await expect(page).toHaveURL(new RegExp(`/courses/${category.slug}/${courses[0].slug}$`));
});

test("course detail renders the API data and the syllabus accordion works", async ({ page }) => {
  const courses = await apiData<PublicCourse[]>("GET", "/courses", { auth: false });
  const slug = courses.find((c) => c.slug === "revit-architecture")?.slug ?? courses[0].slug;
  const course = await apiData<CourseDetail>("GET", `/courses/${slug}`, { auth: false });
  await page.goto(`/courses/${course.category.slug}/${course.slug}`);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(course.detail.heroTitle);
  await expect(page).toHaveTitle(new RegExp(course.title.split(" ")[0]));
  const meta = page.locator("dl");
  await expect(meta).toContainText(course.detail.meta.duration);
  await expect(meta).toContainText(course.detail.meta.mode);
  for (const outcome of course.detail.outcomes) await expect(page.getByText(outcome, { exact: true })).toBeVisible();
  for (const s of course.detail.software) await expect(page.getByText(s, { exact: true }).first()).toBeVisible();
  for (const c of course.detail.careers) await expect(page.getByText(c, { exact: true }).first()).toBeVisible();

  // Hero image is the LCP and must load eagerly.
  const hero = page.locator("img").first();
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(hero).toHaveAttribute("alt", /.+/);

  // Syllabus accordion: all modules open by default, toggling collapses/expands.
  const buttons = page.getByRole("button", { name: /.+/ }).filter({ has: page.locator(":scope[aria-controls]") });
  const moduleButtons = page.locator("h3 button[aria-expanded]");
  await expect(moduleButtons).toHaveCount(course.detail.modules.length);
  if (course.detail.modules.length) {
    const first = moduleButtons.first();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    const panelId = await first.getAttribute("aria-controls");
    await expect(page.locator(`[id="${panelId}"]`)).toHaveAttribute("aria-hidden", "true");
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
  }
  void buttons;

  // Related programs link to sibling courses of the same category.
  const related = page.getByRole("heading", { level: 2, name: "Related Programs" });
  if (course.related.length) {
    await expect(related).toBeVisible();
    for (const r of course.related) {
      await expect(page.getByRole("link", { name: new RegExp(r.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).first()).toHaveAttribute("href", `/courses/${r.category.slug}/${r.slug}`);
    }
  } else {
    await expect(related).toHaveCount(0);
  }

  // CTA buttons
  await expect(page.getByRole("link", { name: "Enquire Now" }).nth(1)).toHaveAttribute("href", "/contact");
  await expect(page.getByRole("link", { name: "Download Syllabus" })).toHaveAttribute("href", "/contact");
});

test("home page featured courses and categories come from the API", async ({ page }) => {
  const [categories, featured] = await Promise.all([
    apiData<PublicCategory[]>("GET", "/categories", { auth: false }),
    apiData<PublicCourse[]>("GET", "/courses?featured=true", { auth: false }),
  ]);
  await page.goto("/");
  for (const c of categories) {
    await expect(page.getByRole("link", { name: c.name, exact: true }).first()).toHaveAttribute("href", `/courses/${c.slug}`);
  }
  for (const f of featured) {
    await expect(page.getByRole("link", { name: new RegExp(f.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).first()).toHaveAttribute("href", `/courses/${f.category.slug}/${f.slug}`);
  }
});
