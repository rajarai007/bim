import { test, expect } from "../../helpers/fixtures";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("mobile layout", () => {
  for (const path of ["/", "/about", "/courses", "/courses/bim-digital-construction", "/courses/bim-digital-construction/revit-architecture", "/trainers", "/projects", "/faq", "/contact", "/privacy-policy"]) {
    test(`${path} has no horizontal overflow on a phone`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("hamburger menu opens the drawer, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    const drawer = page.locator("#mobile-nav");
    await expect(drawer).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await drawer.getByRole("link", { name: "Courses", exact: true }).click();
    await expect(page).toHaveURL(/\/courses$/);
    // Drawer closes on navigation and body scroll is restored.
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(drawer).toHaveAttribute("aria-hidden", "true");
  });

  test("contact form is usable on a phone", async ({ page }) => {
    await page.goto("/contact");
    await page.locator("#fullName").fill("Mobile Check");
    await expect(page.locator("#fullName")).toBeInViewport();
    await page.getByRole("button", { name: "Submit Query" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Submit Query" })).toBeInViewport();
  });
});
