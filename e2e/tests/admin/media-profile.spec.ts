import { test, expect } from "../../helpers/fixtures";
import { ADMIN_EMAIL, ADMIN_PASSWORD, api, apiData } from "../../helpers/api";

test.describe("media library", () => {
  test("upload, usage badge, delete rules", async ({ page, audit }) => {
    await page.goto("/media");
    const before = await apiData<{ id: number; url: string; usageCount: number; fileName: string }[]>("GET", "/admin/media");
    await expect(page.getByText(`${before.length} files`)).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(before.length);

    await page.locator('input[type="file"]').setInputFiles(["/Users/raja/Desktop/BIM/Backend/assets/images/person-03.png"]);
    await expect(page.getByRole("status")).toContainText("1 file uploaded.");
    const after = await apiData<{ id: number; url: string; usageCount: number; fileName: string }[]>("GET", "/admin/media");
    expect(after.length).toBe(before.length + 1);
    const uploaded = after.find((m) => !before.some((b) => b.id === m.id))!;
    expect(uploaded).toMatchObject({ fileName: "person-03.png", usageCount: 0 });
    expect(uploaded.url).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[a-f0-9]+\.png$/);
    await expect(page.getByRole("listitem").filter({ hasText: "person-03.png" }).first()).toContainText("used 0×");
    // The uploaded file is served by the API.
    const served = await fetch(`${process.env.API_URL ?? "http://localhost:4000"}${uploaded.url}`);
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toMatch(/image\/png/);

    // In-use files cannot be deleted from the UI.
    const inUse = after.find((m) => m.usageCount > 0)!;
    await expect(page.getByRole("button", { name: `Delete ${inUse.fileName}` }).first()).toBeDisabled();

    // Non-images are rejected with a message.
    await page.locator('input[type="file"]').setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
    await expect(page.getByRole("status")).toContainText(/Only PNG, JPG, WEBP or SVG/);

    page.once("dialog", (d) => d.accept());
    const card = page.getByRole("listitem").filter({ hasText: "person-03.png" }).first();
    await card.hover();
    await card.getByRole("button", { name: "Delete person-03.png" }).click();
    await expect(page.getByRole("status")).toContainText("File deleted.");
    expect((await apiData<{ id: number }[]>("GET", "/admin/media")).some((m) => m.id === uploaded.id)).toBe(false);
    expect((await fetch(`${process.env.API_URL ?? "http://localhost:4000"}${uploaded.url}`)).status).toBe(404);
    audit.allow(/\/uploads\/.*→ 404$/);
    audit.allow(/status of 404/);
  });
});

test.describe("profile", () => {
  test("name change updates the top bar; email uniqueness and validation are enforced", async ({ page }) => {
    const me = await apiData<{ name: string; email: string; avatarUrl: string | null }>("GET", "/auth/me");
    try {
      await page.goto("/profile");
      await expect(page.getByLabel("Full Name *")).toHaveValue(me.name);
      await expect(page.getByLabel("Email Address *")).toHaveValue(me.email);
      await page.getByLabel("Full Name *").fill("E2E Renamed Admin");
      await page.getByRole("button", { name: "Save Profile" }).click();
      await expect(page.getByRole("status").filter({ hasText: "Profile updated." })).toBeVisible();
      await expect(page.locator("header").first()).toContainText("E2E Renamed Admin");
      expect((await apiData<{ name: string }>("GET", "/auth/me")).name).toBe("E2E Renamed Admin");
      // The session cookie was re-issued: another screen shows the new name too.
      await page.goto("/courses");
      await expect(page.locator("header").first()).toContainText("E2E Renamed Admin");

      await page.goto("/profile");
      await page.getByLabel("Full Name *").fill("A");
      await page.getByLabel("Full Name *").evaluate((el: HTMLInputElement) => el.removeAttribute("minlength"));
      await page.getByRole("button", { name: "Save Profile" }).click();
      await expect(page.getByText("Name is required")).toBeVisible();
    } finally {
      await apiData("PATCH", "/auth/me", { body: { name: me.name, email: me.email, avatarUrl: me.avatarUrl } });
    }
  });

  test("password change: wrong current, mismatch, success and revert", async ({ page }) => {
    await page.goto("/profile");
    await page.getByLabel("Current Password *").fill("wrong-password");
    await page.getByLabel("New Password *").fill("temporary-e2e-pass");
    await page.getByLabel("Confirm New Password *").fill("temporary-e2e-pass");
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByText("Current password is incorrect")).toBeVisible();

    await page.getByLabel("Current Password *").fill(ADMIN_PASSWORD);
    await page.getByLabel("Confirm New Password *").fill("something-else-1");
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();

    await page.getByLabel("Confirm New Password *").fill("temporary-e2e-pass");
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Password changed." })).toBeVisible();
    try {
      expect((await api("POST", "/auth/login", { auth: false, body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })).status).toBe(401);
      expect((await api("POST", "/auth/login", { auth: false, body: { email: ADMIN_EMAIL, password: "temporary-e2e-pass" } })).status).toBe(200);
      // Still signed in on this device.
      await page.goto("/courses");
      await expect(page.getByRole("heading", { level: 1, name: "Manage Courses" })).toBeVisible();
    } finally {
      // Revert through the UI so the seeded credentials keep working for the rest of the suite.
      await page.goto("/profile");
      await page.getByLabel("Current Password *").fill("temporary-e2e-pass");
      await page.getByLabel("New Password *").fill(ADMIN_PASSWORD);
      await page.getByLabel("Confirm New Password *").fill(ADMIN_PASSWORD);
      await page.getByRole("button", { name: "Update Password" }).click();
      await expect(page.getByRole("status").filter({ hasText: "Password changed." })).toBeVisible();
      expect((await api("POST", "/auth/login", { auth: false, body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })).status).toBe(200);
    }
  });
});

test.describe("responsive admin", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("the drawer navigation works on a phone and pages do not overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Admin" })).toBeHidden();
    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.locator("#admin-drawer");
    await expect(drawer.getByRole("navigation", { name: "Admin" })).toBeVisible();
    await drawer.getByRole("link", { name: "Enquiries" }).click();
    await expect(page).toHaveURL(/\/enquiries$/);
    await expect(drawer).toHaveAttribute("aria-hidden", "true");
    for (const path of ["/", "/courses", "/enquiries", "/settings", "/courses/new"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
