import { test as setup, expect } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../../helpers/api";

/** Signs in through the real login form once and stores the session cookie for the admin project. */
setup("sign in as the seeded admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === "bim_admin_session");
  expect(session, "session cookie set").toBeDefined();
  expect(session!.httpOnly).toBe(true);
  expect(session!.sameSite).toBe("Lax");
  await page.context().storageState({ path: ".auth/admin.json" });
});
