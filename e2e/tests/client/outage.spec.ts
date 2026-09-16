import { test, expect } from "../../helpers/fixtures";
import { startApi, stopApi, waitForApiDown } from "../../helpers/api-process";

/**
 * Error state when the API is unreachable. Stops the backend process, so it
 * only runs when explicitly enabled: E2E_API_CONTROL=1.
 */
test.describe("API outage", () => {
  test.skip(process.env.E2E_API_CONTROL !== "1", "set E2E_API_CONTROL=1 to run the outage scenario");
  test.describe.configure({ mode: "serial" });

  test.afterAll(async () => {
    await startApi().catch(() => undefined);
  });

  test("the site shows a recoverable error page and the contact form reports the failure", async ({ page, audit }) => {
    stopApi();
    await waitForApiDown();
    audit.allow(/→ 500$/);
    audit.allow(/status of 500/);
    audit.allow(/Unable to reach the API/);
    audit.allow(/\[error\]/); // the error boundary logs the caught error

    const res = await page.goto("/courses");
    expect(res?.status()).toBe(500);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("We couldn't load this page");
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    // The chrome still renders from static fallbacks.
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await startApi();
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Courses");
  });
});
