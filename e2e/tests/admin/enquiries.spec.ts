import { test, expect } from "../../helpers/fixtures";
import { api, apiData, deleteEnquiriesMatching, uniq, type ApiEnquiry } from "../../helpers/api";

const PREFIX = "E2E Admin Lead";

test.describe("enquiries", () => {
  let lead: { id: number; fullName: string };

  test.beforeAll(async () => {
    const courses = await apiData<{ slug: string; title: string }[]>("GET", "/courses", { auth: false });
    const fullName = uniq(PREFIX);
    const created = await apiData<{ id: number }>("POST", "/enquiries", {
      auth: false,
      body: { fullName, mobile: "9876512345", email: "admin.lead@example.com", courseSlug: courses[0].slug, qualification: "B.Tech", experience: "Student", message: "Fees please", consent: true },
    });
    lead = { id: created.id, fullName };
  });

  test.afterAll(async () => {
    await deleteEnquiriesMatching(PREFIX);
  });

  test("stats cards match the API", async ({ page, audit }) => {
    const stats = await apiData<{ total: number; new: number; inProgress: number; converted: number }>("GET", "/admin/enquiries/stats");
    await page.goto("/enquiries");
    for (const [label, value] of [["Total Enquiries", stats.total], ["New Enquiries", stats.new], ["In Progress", stats.inProgress], ["Converted", stats.converted]] as const) {
      await expect(page.locator("div").filter({ hasText: label }).filter({ hasText: value.toLocaleString("en-IN") }).first(), label).toBeVisible();
    }
    expect(audit.problems).toEqual([]);
  });

  test("list, search, filters, pagination", async ({ page }) => {
    const first = await apiData<{ items: ApiEnquiry[]; pagination: { total: number; totalPages: number } }>("GET", "/admin/enquiries?pageSize=10");
    await page.goto("/enquiries");
    // Type only after hydration: the production build renders faster than React attaches handlers.
    await page.waitForLoadState("networkidle");
    const table = page.getByRole("table", { name: "Leads" });
    const rows = table.getByRole("row").filter({ hasNot: page.getByRole("columnheader") });
    await expect(rows).toHaveCount(Math.min(10, first.pagination.total));
    await expect(rows.first()).toContainText(first.items[0].fullName);
    await expect(page.getByText(`of ${first.pagination.total} entries`)).toBeVisible();

    await page.getByRole("searchbox", { name: "Search leads" }).fill("admin.lead@example.com");
    await expect(page).toHaveURL(/q=admin\.lead/);
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(lead.fullName);
    await expect(rows.first()).toContainText("New");
    await page.getByRole("searchbox", { name: "Search leads" }).fill("");

    await page.getByLabel("Filter by status").selectOption("converted");
    await expect(page).toHaveURL(/status=converted/);
    const converted = await apiData<{ items: ApiEnquiry[]; pagination: { total: number } }>("GET", "/admin/enquiries?status=converted&pageSize=10");
    if (converted.pagination.total) {
      await expect(rows).toHaveCount(Math.min(10, converted.pagination.total));
      for (let i = 0; i < Math.min(10, converted.pagination.total); i++) await expect(rows.nth(i)).toContainText("Converted");
    } else {
      await expect(page.getByText("No leads match the current filters.")).toBeVisible();
    }
    await page.getByLabel("Filter by status").selectOption("all");
    await expect(page).not.toHaveURL(/status=/);

    await page.getByLabel("Date range").selectOption("7");
    await expect(page).toHaveURL(/days=7/);
    const recent = await apiData<{ pagination: { total: number } }>("GET", "/admin/enquiries?days=7&pageSize=10");
    await expect(page.getByText(`of ${recent.pagination.total} entries`)).toBeVisible();
    await page.getByLabel("Date range").selectOption("all");

    const courseTitle = first.items.find((e) => e.courseName)?.courseName;
    if (courseTitle) {
      await page.getByLabel("Filter by course").selectOption(courseTitle);
      await expect(page).toHaveURL(/course=/);
      const byCourse = await apiData<{ items: ApiEnquiry[] }>("GET", `/admin/enquiries?course=${encodeURIComponent(courseTitle)}&pageSize=10`);
      await expect(rows).toHaveCount(byCourse.items.length);
      await page.getByLabel("Filter by course").selectOption("all");
    }

    if (first.pagination.totalPages > 1) {
      await page.getByRole("navigation", { name: "Pagination" }).getByRole("button", { name: "2", exact: true }).click();
      await expect(page).toHaveURL(/page=2/);
      const second = await apiData<{ items: ApiEnquiry[] }>("GET", "/admin/enquiries?page=2&pageSize=10");
      await expect(rows.first()).toContainText(second.items[0].fullName);
    }
  });

  test("manage panel shows details, updates status and saves notes to the database", async ({ page }) => {
    await page.goto(`/enquiries?q=${encodeURIComponent(lead.fullName)}`);
    const row = page.getByRole("row").filter({ hasText: lead.fullName });
    await row.getByRole("button", { name: "Manage" }).click();
    const panel = page.locator(`#lead-${lead.id}-details`);
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Education: B.Tech");
    await expect(panel).toContainText("Experience: Student");
    await expect(panel).toContainText("Fees please");
    await expect(panel).toContainText("Source: Contact form");
    await expect(panel).toContainText("Consent: Given");
    await expect(panel).toContainText("No notes yet.");

    await panel.getByRole("button", { name: "Mark Contacted" }).click();
    await expect(page.getByRole("status").filter({ hasText: `Lead #${lead.id} marked contacted.` })).toBeVisible();
    await expect(row.first()).toContainText("Contacted");
    expect((await apiData<ApiEnquiry>("GET", `/admin/enquiries/${lead.id}`)).status).toBe("contacted");

    await panel.getByRole("button", { name: "Follow-up" }).click();
    await expect(row.first()).toContainText("In Follow-up");
    expect((await apiData<ApiEnquiry>("GET", `/admin/enquiries/${lead.id}`)).status).toBe("follow-up");

    const saveNote = panel.getByRole("button", { name: "Add Note & Save" });
    await expect(saveNote).toBeDisabled();
    await panel.getByLabel("New admin note").fill("Called twice, callback tomorrow.");
    await expect(saveNote).toBeEnabled();
    await saveNote.click();
    await expect(page.getByRole("status").filter({ hasText: "Note saved." })).toBeVisible();
    await expect(panel).toContainText("Called twice, callback tomorrow.");
    await expect(panel).toContainText(/ADMIN NOTES \(Latest/);
    await expect(panel.getByLabel("New admin note")).toHaveValue("");
    const detail = await apiData<ApiEnquiry & { notes: { note: string; adminName: string }[] }>("GET", `/admin/enquiries/${lead.id}`);
    expect(detail.notes).toHaveLength(1);
    expect(detail.notes[0]).toMatchObject({ note: "Called twice, callback tomorrow.", adminName: expect.any(String) });

    await panel.getByRole("button", { name: "Mark Converted" }).click();
    await expect(row.first()).toContainText("Converted");
    await panel.getByRole("button", { name: "Mark Lost" }).click();
    await expect(row.first()).toContainText("Lost");
    expect((await apiData<ApiEnquiry>("GET", `/admin/enquiries/${lead.id}`)).status).toBe("lost");

    await row.getByRole("button", { name: "Collapse" }).click();
    await expect(panel).toBeHidden();
  });

  test("status change survives a reload and shows on the dashboard", async ({ page }) => {
    await page.goto(`/enquiries?q=${encodeURIComponent(lead.fullName)}`);
    await expect(page.getByRole("row").filter({ hasText: lead.fullName })).toContainText("Lost");
    await page.goto("/");
    await expect(page.getByText(lead.fullName)).toBeVisible();
  });

  test("CSV export downloads the filtered leads", async ({ page }) => {
    await page.goto(`/enquiries?q=${encodeURIComponent(lead.fullName)}`);
    const exportLink = page.getByRole("link", { name: "Export Leads" });
    const href = await exportLink.getAttribute("href");
    expect(new URL(href!, "http://x").searchParams.get("q")).toBe(lead.fullName);
    const [download] = await Promise.all([page.waitForEvent("download"), exportLink.click()]);
    expect(download.suggestedFilename()).toMatch(/^leads-\d{4}-\d{2}-\d{2}\.csv$/);
    const text = await (await import("node:fs/promises")).readFile(await download.path(), "utf8");
    const lines = text.trim().split(/\r?\n/);
    expect(lines[0]).toMatch(/^ID,Name,Phone,Email/);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain(lead.fullName);
    expect(lines[1]).toContain("Called twice, callback tomorrow.");
  });

  test("the export route requires a session", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const res = await ctx.request.get("/enquiries/export", { maxRedirects: 0 });
    expect([302, 307]).toContain(res.status());
    expect(res.headers().location).toMatch(/\/login$/);
    await ctx.close();
  });

  test("deleting an enquiry through the API removes it from the list", async ({ page }) => {
    const res = await api("DELETE", `/admin/enquiries/${lead.id}`);
    expect(res.status).toBe(200);
    await page.goto(`/enquiries?q=${encodeURIComponent(lead.fullName)}`);
    await expect(page.getByText("No leads match the current filters.")).toBeVisible();
  });
});
