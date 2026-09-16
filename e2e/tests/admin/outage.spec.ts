import { test, expect } from "../../helpers/fixtures";
import { startApi, stopApi, waitForApiDown } from "../../helpers/api-process";

test.describe("API outage", () => {
  test.skip(process.env.E2E_API_CONTROL !== "1", "set E2E_API_CONTROL=1 to run the outage scenario");
  test.describe.configure({ mode: "serial" });

  test.afterAll(async () => {
    await startApi().catch(() => undefined);
  });

  test("admin screens show the unreachable-API error and recover", async ({ page, audit }) => {
    stopApi();
    await waitForApiDown();
    audit.allow(/→ 500$/);
    audit.allow(/status of 500/);
    audit.allow(/Unable to reach the API/);
    audit.allow(/\[error\]/);

    await page.goto("/courses");
    await expect(page.getByRole("heading", { name: "Unable to load this screen" })).toBeVisible();
    await expect(page.getByText(/The API is not reachable right now/)).toBeVisible();
    await expect(page.getByText(/Minified React error/)).toHaveCount(0);

    await startApi();
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Manage Courses" })).toBeVisible();
  });

  test("login reports an unreachable API instead of a generic failure", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    stopApi();
    await waitForApiDown();
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("admin@bimcareeracademy.com");
    await page.getByLabel("Password", { exact: true }).fill("admin123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator('p[role="alert"]')).toContainText("Unable to reach the API");
    await startApi();
    await ctx.close();
  });
});
