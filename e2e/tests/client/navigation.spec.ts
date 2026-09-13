import { test, expect } from "../../helpers/fixtures";
import { apiData } from "../../helpers/api";

test.describe("header navigation", () => {
  const links: [string, string][] = [
    ["Home", "/"],
    ["About", "/about"],
    ["Courses", "/courses"],
    ["Trainers", "/trainers"],
    ["Projects", "/projects"],
    ["Contact", "/contact"],
  ];

  test("primary nav links navigate and mark the active page", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [label, href] of links) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${href.replace("/", "\\/")}$`));
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    }
  });

  test("anchor links scroll to the home sections", async ({ page }) => {
    await page.goto("/about");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Why Choose Us" }).click();
    await expect(page).toHaveURL(/\/#why-choose-us$/);
    await expect(page.locator("#why-choose-us")).toBeVisible();
    await expect.poll(async () => page.evaluate(() => Math.abs(document.querySelector("#why-choose-us")!.getBoundingClientRect().top) < window.innerHeight)).toBe(true);
    await nav.getByRole("link", { name: "Testimonials" }).click();
    await expect(page).toHaveURL(/\/#testimonials$/);
    await expect(page.locator("#testimonials")).toBeVisible();
  });

  test("logo, Enquire Now and contact shortcuts", async ({ page }) => {
    const settings = await apiData<{ contact: { phone: string; whatsapp: string | null } }>("GET", "/settings", { auth: false });
    await page.goto("/about");
    const header = page.getByRole("banner");
    await header.getByRole("link", { name: "Enquire Now" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await header.getByRole("link", { name: /BIM Career Academy/i }).first().click();
    await expect(page).toHaveURL(/\/$/);
    const phone = header.getByRole("link", { name: new RegExp(`Call`) });
    await expect(phone).toHaveAttribute("href", `tel:${settings.contact.phone.replace(/[^0-9+]/g, "")}`);
    if (settings.contact.whatsapp) {
      const wa = header.getByRole("link", { name: "Chat on WhatsApp" });
      await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+$/);
      await expect(wa).toHaveAttribute("target", "_blank");
    }
  });

  test("skip link focuses main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe("footer", () => {
  test("footer shows API-driven contact, categories, social links and quick links", async ({ page }) => {
    const [settings, categories] = await Promise.all([
      apiData<{ name: string; contact: { phone: string; email: string; address: string }; social: Record<string, string | null> }>("GET", "/settings", { auth: false }),
      apiData<{ slug: string; footerLabel: string }[]>("GET", "/categories", { auth: false }),
    ]);
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText(settings.contact.address);
    await expect(footer).toContainText(settings.contact.phone);
    await expect(footer.getByRole("link", { name: new RegExp(settings.contact.email) })).toHaveAttribute("href", `mailto:${settings.contact.email}`);
    await expect(footer).toContainText(`© ${new Date().getFullYear()} ${settings.name}`);
    for (const c of categories) {
      await expect(footer.getByRole("link", { name: c.footerLabel, exact: true })).toHaveAttribute("href", `/courses/${c.slug}`);
    }
    for (const [key, label] of [["instagram", "Instagram"], ["facebook", "Facebook"], ["linkedin", "LinkedIn"], ["youtube", "YouTube"]] as const) {
      const link = footer.getByRole("link", { name: label, exact: true });
      if (settings.social[key]) {
        await expect(link).toHaveAttribute("href", settings.social[key]!);
        await expect(link).toHaveAttribute("rel", /noreferrer/);
      } else {
        await expect(link).toHaveCount(0);
      }
    }
    await footer.getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL(/\/privacy-policy$/);
  });
});

test.describe("breadcrumbs", () => {
  test("course detail breadcrumb links back up the hierarchy", async ({ page }) => {
    const courses = await apiData<{ slug: string; title: string; category: { slug: string; name: string } }[]>("GET", "/courses", { auth: false });
    const course = courses[0];
    await page.goto(`/courses/${course.category.slug}/${course.slug}`);
    const crumbs = page.getByRole("navigation", { name: /breadcrumb/i });
    await expect(crumbs).toContainText(course.title);
    await crumbs.getByRole("link", { name: course.category.name }).click();
    await expect(page).toHaveURL(new RegExp(`/courses/${course.category.slug}$`));
    await page.getByRole("navigation", { name: /breadcrumb/i }).getByRole("link", { name: "Courses" }).click();
    await expect(page).toHaveURL(/\/courses$/);
  });
});
