import { test, expect } from "../../helpers/fixtures";
import { apiData } from "../../helpers/api";
import { CLIENT_URL } from "../../playwright.config";

type Settings = { academyName: string; address: string; phone: string; whatsapp: string | null; email: string; workingHours: string | null; logoUrl: string | null; instagramUrl: string | null; facebookUrl: string | null; linkedinUrl: string | null; youtubeUrl: string | null; webhookUrl: string | null; gaMeasurementId: string | null };

test.describe("settings", () => {
  let original: Settings;
  test.beforeAll(async () => {
    original = await apiData<Settings>("GET", "/admin/settings");
  });
  test.afterAll(async () => {
    const { ...restore } = original;
    await apiData("PATCH", "/admin/settings", { body: restore });
  });

  test("academy info tab saves and the client reflects it", async ({ page, audit }) => {
    await page.goto("/settings");
    await expect(page.getByLabel("Academy Name *")).toHaveValue(original.academyName);
    await expect(page.getByLabel("Phone Number *")).toHaveValue(original.phone);
    await page.getByLabel("Phone Number *").fill("+91 90000 11111");
    await page.getByLabel("Working Hours").fill("Mon–Sat 9am–7pm (E2E)");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("status")).toContainText("Changes saved.");
    expect(await apiData<Settings>("GET", "/admin/settings")).toMatchObject({ phone: "+91 90000 11111", workingHours: "Mon–Sat 9am–7pm (E2E)", academyName: original.academyName });
    await page.reload();
    await expect(page.getByLabel("Phone Number *")).toHaveValue("+91 90000 11111");

    await page.goto(`${CLIENT_URL}/contact`);
    await expect(page.getByRole("main")).toContainText("+91 90000 11111");
    await expect(page.getByRole("main")).toContainText("Mon–Sat 9am–7pm (E2E)");
    expect(audit.problems).toEqual([]);
  });

  test("validation errors from the API are shown on the field", async ({ page }) => {
    await page.goto("/settings");
    const email = page.getByLabel("Primary Support Email *");
    await email.fill("not-an-email");
    // Bypass the native email check to exercise the server-side validation.
    await email.evaluate((el: HTMLInputElement) => (el.type = "text"));
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Validation failed");
    expect((await apiData<Settings>("GET", "/admin/settings")).email).toBe(original.email);
  });

  test("social media tab saves independently", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Social Media" }).click();
    await expect(page.getByRole("tab", { name: "Social Media" })).toHaveAttribute("aria-selected", "true");
    await page.getByLabel("YouTube Channel").fill("https://youtube.com/@e2e");
    await page.getByLabel("Instagram Feed").fill("");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("status")).toContainText("Changes saved.");
    const saved = await apiData<Settings>("GET", "/admin/settings");
    expect(saved.youtubeUrl).toBe("https://youtube.com/@e2e");
    expect(saved.instagramUrl).toBeNull();
    expect(saved.phone).toBe("+91 90000 11111"); // untouched by this tab

    await page.goto(`${CLIENT_URL}/`);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "YouTube", exact: true })).toHaveAttribute("href", "https://youtube.com/@e2e");
    await expect(footer.getByRole("link", { name: "Instagram", exact: true })).toHaveCount(0);
  });

  test("integration tab saves the webhook and GA id", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Integration API" }).click();
    await expect(page.getByLabel("Public Enquiry Endpoint")).toHaveValue(/\/api\/v1\/enquiries$/);
    await page.getByLabel("Webhook URL (CRM sync)").fill("https://crm.example.com/hooks/e2e");
    await page.getByLabel("Google Analytics Measurement ID").fill("G-E2E12345");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("status")).toContainText("Changes saved.");
    expect(await apiData<Settings>("GET", "/admin/settings")).toMatchObject({ webhookUrl: "https://crm.example.com/hooks/e2e", gaMeasurementId: "G-E2E12345" });

    await page.getByLabel("Webhook URL (CRM sync)").fill("ftp://bad");
    await page.getByLabel("Webhook URL (CRM sync)").evaluate((el: HTMLInputElement) => (el.type = "text"));
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByText("Must be a valid http(s) URL")).toBeVisible();
  });

  test("logo upload and removal", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("button", { name: "Upload New Logo" }).click();
    await page.locator('input[type="file"]').setInputFiles("/Users/raja/Desktop/BIM/Backend/assets/images/avatar-admin.png");
    await expect(page.getByRole("button", { name: "Remove image" })).toBeVisible();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("status")).toContainText("Changes saved.");
    const saved = await apiData<Settings>("GET", "/admin/settings");
    expect(saved.logoUrl).toMatch(/^\/uploads\//);
    const media = (await apiData<{ id: number; url: string; usageCount: number }[]>("GET", "/admin/media")).find((m) => m.url === saved.logoUrl)!;
    expect(media.usageCount).toBe(1);

    await page.reload();
    await expect(page.getByRole("img", { name: "Academy logo" })).toBeVisible();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("status")).toContainText("Changes saved.");
    expect((await apiData<Settings>("GET", "/admin/settings")).logoUrl).toBeNull();
    await apiData("DELETE", `/admin/media/${media.id}`);
  });
});

test.describe("SEO", () => {
  test("meta title/description save per page and appear on the client", async ({ page }) => {
    const pages = await apiData<{ id: number; path: string; title: string; metaTitle: string | null; metaDescription: string | null }[]>("GET", "/admin/pages");
    const faq = pages.find((p) => p.path === "/faq")!;
    try {
      await page.goto("/seo");
      const card = page.locator(`#page-${faq.id}`);
      await expect(card.getByRole("heading", { name: faq.title })).toBeVisible();
      await card.getByLabel("Meta Title").fill("E2E FAQ Title");
      await card.getByLabel("Meta Description").fill("E2E FAQ description");
      await expect(card.getByText("13 / 60 characters")).toBeVisible();
      await page.getByRole("button", { name: "Save Changes" }).click();
      await expect(page.getByRole("status")).toContainText("SEO settings saved.");
      expect((await apiData<{ id: number; metaTitle: string }[]>("GET", "/admin/pages")).find((p) => p.id === faq.id)!.metaTitle).toBe("E2E FAQ Title");
      await page.goto(`${CLIENT_URL}/faq`);
      await expect(page).toHaveTitle("E2E FAQ Title");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "E2E FAQ description");
    } finally {
      await apiData("PATCH", `/admin/pages/${faq.id}`, { body: { metaTitle: faq.metaTitle, metaDescription: faq.metaDescription } });
    }
  });

  test("content screen lists pages with edit and open links", async ({ page }) => {
    const pages = await apiData<{ id: number; path: string; title: string; sectionCount: number }[]>("GET", "/admin/pages");
    await page.goto("/content");
    for (const p of pages) {
      const row = page.locator("tbody tr").filter({ hasText: p.title }).first();
      await expect(row).toContainText(p.path);
      await expect(row).toContainText(String(p.sectionCount));
      await expect(row.getByRole("link", { name: `Edit ${p.title}` })).toHaveAttribute("href", `/seo#page-${p.id}`);
      await expect(row.getByRole("link", { name: `Open ${p.title} on the website` })).toHaveAttribute("href", `${CLIENT_URL}${p.path}`);
    }
    await page.locator("tbody tr").first().getByRole("link", { name: /^Edit/ }).click();
    await expect(page).toHaveURL(/\/seo#page-\d+$/);
  });
});
