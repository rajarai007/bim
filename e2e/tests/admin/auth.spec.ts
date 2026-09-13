import { test, expect } from "../../helpers/fixtures";
import { ADMIN_EMAIL, ADMIN_PASSWORD, api } from "../../helpers/api";

// These tests exercise the login flow itself, so they start without a session.
test.use({ storageState: { cookies: [], origins: [] } });

const PROTECTED = ["/", "/courses", "/courses/new", "/categories", "/enquiries", "/trainers", "/testimonials", "/projects", "/faqs", "/content", "/media", "/seo", "/settings", "/profile", "/enquiries/export?status=new"];

test("every protected screen redirects an anonymous visitor to /login", async ({ page }) => {
  for (const path of PROTECTED) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { level: 1, name: "Admin Panel Login" })).toBeVisible();
  }
});

test("an invalid or tampered session cookie is dropped and redirected", async ({ page, context, audit }) => {
  await context.addCookies([{ name: "bim_admin_session", value: "not.a.jwt", domain: "localhost", path: "/" }]);
  await page.goto("/courses");
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).find((c) => c.name === "bim_admin_session")).toBeUndefined();

  // A structurally valid JWT signed with the wrong secret must be rejected too.
  const forged = [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify({ sub: "1", email: ADMIN_EMAIL, role: "super_admin", exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url"),
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  ].join(".");
  await context.addCookies([{ name: "bim_admin_session", value: forged, domain: "localhost", path: "/" }]);
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login$/);
  void audit;
});

test("wrong credentials show an error and keep the email", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill("definitely-wrong");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText("Invalid email or password");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email Address")).toHaveValue(ADMIN_EMAIL);
});

test("empty fields are blocked by native validation", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.getByLabel("Email Address").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
});

test("password visibility toggle works", async ({ page }) => {
  await page.goto("/login");
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("secret");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(password).toHaveAttribute("type", "password");
});

test("login → session persists across reload → logout clears it", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(ADMIN_EMAIL.toUpperCase());
  await page.getByLabel("Password", { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByLabel("Remember Me").uncheck();
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/);
  const cookie = (await context.cookies()).find((c) => c.name === "bim_admin_session")!;
  expect(cookie.expires).toBe(-1); // session cookie when "Remember Me" is off

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  // Signed-in users are bounced away from the auth screens.
  await page.goto("/login");
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.cookies()).find((c) => c.name === "bim_admin_session")).toBeUndefined();
  await page.goto("/courses");
  await expect(page).toHaveURL(/\/login$/);
});

test("Remember Me issues a persistent cookie", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(ADMIN_PASSWORD);
  await expect(page.getByLabel("Remember Me")).toBeChecked();
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/);
  const cookie = (await context.cookies()).find((c) => c.name === "bim_admin_session")!;
  expect(cookie.expires).toBeGreaterThan(Date.now() / 1000 + 20 * 24 * 3600);
});

test("expired session shows the expiry notice on the login page", async ({ page }) => {
  await page.goto("/logout?reason=expired");
  await expect(page).toHaveURL(/\/login\?reason=expired$/);
  await expect(page.getByRole("status")).toContainText("Your session has expired");
});

test("forgot-password never reveals whether an account exists", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot Password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await page.getByLabel(/Email/).fill("nobody@example.com");
  await page.getByRole("button", { name: /Send/i }).click();
  await expect(page.getByRole("status")).toContainText(/reset link/i);
});

test("reset-password rejects missing, malformed and unknown tokens", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page.locator('p[role="alert"]')).toContainText("invalid");
  await page.goto("/reset-password?token=abc");
  await expect(page.locator('p[role="alert"]')).toContainText("invalid");
  await page.getByRole("link", { name: "Request a new link" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);

  await page.goto(`/reset-password?token=${"f".repeat(64)}`);
  await page.getByLabel("New Password", { exact: true }).fill("brand-new-pass-1");
  await page.getByLabel("Confirm New Password").fill("brand-new-pass-1");
  await page.getByRole("button", { name: /Reset|Save|Set/i }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/invalid or has expired/i);
});

test("reset-password validates the confirmation locally", async ({ page }) => {
  await page.goto(`/reset-password?token=${"a".repeat(64)}`);
  await page.getByLabel("New Password", { exact: true }).fill("brand-new-pass-1");
  await page.getByLabel("Confirm New Password").fill("different-pass-1");
  await page.getByRole("button", { name: /Reset|Save|Set/i }).click();
  await expect(page.getByText("Passwords do not match")).toBeVisible();
});

test("the API rejects a request with no bearer token even when the cookie exists (auth is server-side)", async () => {
  const res = await api("GET", "/admin/dashboard", { auth: false });
  expect(res.status).toBe(401);
});
