import { test, expect } from "../../helpers/fixtures";
import { apiData } from "../../helpers/api";

type Dashboard = {
  stats: { id: string; label: string; value: number; delta: { label: string } }[];
  trend: { label: string; value: number }[];
  byCategory: { label: string; percent: number }[];
  recentEnquiries: { id: number; fullName: string; status: string }[];
};

test("dashboard shows stats, trend, category split and recent enquiries from the API", async ({ page, audit }) => {
  const data = await apiData<Dashboard>("GET", "/admin/dashboard");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  for (const stat of data.stats) {
    const card = page.locator("article, div").filter({ hasText: stat.label }).filter({ hasText: stat.value.toLocaleString("en-IN") }).first();
    await expect(card, stat.label).toBeVisible();
    await expect(page.getByText(stat.delta.label).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Enquiry Trends (Last 7 Days)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enquiries by Category" })).toBeVisible();
  for (const point of data.trend) await expect(page.getByText(point.label, { exact: true }).first()).toBeVisible();
  for (const slice of data.byCategory) await expect(page.getByText(slice.label, { exact: true }).first()).toBeVisible();
  for (const lead of data.recentEnquiries) await expect(page.getByText(lead.fullName, { exact: true }).first()).toBeVisible();
  expect(audit.problems).toEqual([]);
});

test("sidebar navigation reaches every screen and marks the active one", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Admin" });
  const items: [string, string, string][] = [
    ["Courses", "/courses", "Manage Courses"],
    ["Categories", "/categories", "Categories"],
    ["Enquiries", "/enquiries", "Enquiry & Lead Management"],
    ["Trainers", "/trainers", "Trainers"],
    ["Testimonials", "/testimonials", "Testimonials"],
    ["Projects", "/projects", "Projects"],
    ["FAQs", "/faqs", "FAQs"],
    ["Content", "/content", "Content"],
    ["Media", "/media", "Media"],
    ["SEO", "/seo", "SEO"],
    ["Settings", "/settings", "Settings Workspace"],
    ["Dashboard", "/", "Dashboard"],
  ];
  for (const [label, href, title] of items) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${href === "/" ? "" : href}/?$`));
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
  }
  await page.getByRole("link", { name: "My Profile" }).first().click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { level: 1, name: "My Profile" })).toBeVisible();
});

test("top bar shows the signed-in admin and links to the profile", async ({ page }) => {
  const me = await apiData<{ name: string; role: string }>("GET", "/auth/me");
  await page.goto("/courses");
  const header = page.locator("header").first();
  await expect(header).toContainText(me.name);
  await expect(header).toContainText(me.role === "super_admin" ? "Super Admin" : "Admin");
  await header.getByRole("link", { name: "My profile" }).click();
  await expect(page).toHaveURL(/\/profile$/);
});

test("unknown admin URLs and missing courses show the not-found screen inside the shell", async ({ page, audit }) => {
  audit.allow(/→ 404$/);
  audit.allow(/status of 404/);
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();
  await page.getByRole("link", { name: "Back to Dashboard" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/courses/999999/edit");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.goto("/courses/abc/edit");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
