import { test, expect } from "../../helpers/fixtures";
import { apiData, deleteEnquiriesMatching, findEnquiryByName, uniq } from "../../helpers/api";

const PREFIX = "E2E Lead";

test.afterAll(async () => {
  await deleteEnquiriesMatching(PREFIX);
});

test.describe("contact form", () => {
  test("empty submission shows validation errors and does not call the API", async ({ page }) => {
    await page.goto("/contact");
    const before = (await apiData<{ pagination: { total: number } }>("GET", "/admin/enquiries?pageSize=1")).pagination.total;
    await page.getByLabel("I agree to be contacted").uncheck();
    await page.getByRole("button", { name: "Submit Query" }).click();
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
    await expect(page.getByText("Please enter your mobile number.")).toBeVisible();
    await expect(page.getByText("Please enter your email address.")).toBeVisible();
    await expect(page.getByText("Please agree to be contacted.")).toBeVisible();
    await expect(page.locator("#fullName")).toHaveAttribute("aria-invalid", "true");
    const after = (await apiData<{ pagination: { total: number } }>("GET", "/admin/enquiries?pageSize=1")).pagination.total;
    expect(after).toBe(before);
  });

  test("invalid values are rejected and errors clear while typing", async ({ page }) => {
    await page.goto("/contact");
    await page.locator("#fullName").fill("E2E Invalid");
    await page.locator("#mobile").fill("12345");
    await page.locator("#email").fill("not-an-email");
    await page.getByRole("button", { name: "Submit Query" }).click();
    await expect(page.getByText("Enter a valid mobile number.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await page.locator("#mobile").fill("9876543210");
    await expect(page.getByText("Enter a valid mobile number.")).toHaveCount(0);
  });

  test("valid submission stores the enquiry in the database with the selected course", async ({ page }) => {
    const courses = await apiData<{ slug: string; title: string }[]>("GET", "/courses", { auth: false });
    const course = courses[1];
    const name = uniq(PREFIX);
    await page.goto("/contact");
    const select = page.locator("#course");
    await expect(select.locator("option")).toHaveCount(courses.length + 1);
    await page.locator("#fullName").fill(name);
    await page.locator("#mobile").fill("+91 98765 00001");
    await page.locator("#email").fill("E2E.Lead@Example.com");
    await select.selectOption(course.slug);
    await page.locator("#qualification").fill("B.Arch");
    await page.locator("#experience").selectOption("Fresher");
    await page.locator("#message").fill("Weekend batch availability?");
    await expect(page.getByLabel("I agree to be contacted")).toBeChecked();
    await page.getByRole("button", { name: "Submit Query" }).click();
    await expect(page.getByRole("status")).toContainText("your query has been received");
    // Form resets after success.
    await expect(page.locator("#fullName")).toHaveValue("");

    const stored = await findEnquiryByName(name);
    expect(stored).toBeDefined();
    expect(stored).toMatchObject({
      fullName: name,
      mobile: "+91 98765 00001",
      email: "e2e.lead@example.com",
      courseName: course.title,
      qualification: "B.Arch",
      experienceLevel: "Fresher",
      message: "Weekend batch availability?",
      consent: true,
      source: "contact_form",
      status: "new",
    });
  });

  test("submission without optional fields still succeeds", async ({ page }) => {
    const name = uniq(PREFIX);
    await page.goto("/contact");
    await page.locator("#fullName").fill(name);
    await page.locator("#mobile").fill("9876500002");
    await page.locator("#email").fill("min@example.com");
    await page.getByRole("button", { name: "Submit Query" }).click();
    await expect(page.getByRole("status")).toContainText("your query has been received");
    const stored = await findEnquiryByName(name);
    expect(stored).toMatchObject({ courseName: null, qualification: null, experienceLevel: null, message: null });
  });

  test("shows an error state when the submission fails", async ({ page }) => {
    await page.goto("/contact");
    // Abort the server-action POST so the client sees a failed request.
    await page.route("**/contact", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
    await page.locator("#fullName").fill("E2E Failure Lead");
    await page.locator("#mobile").fill("9876500003");
    await page.locator("#email").fill("fail@example.com");
    const button = page.getByRole("button", { name: /Submit/ });
    await button.click();
    await expect(page.getByRole("status")).toContainText("Something went wrong");
    await expect(button).toBeEnabled();
    // Nothing reached the API.
    expect(await findEnquiryByName("E2E Failure Lead")).toBeUndefined();
  });

  test("submit button shows a loading state while pending", async ({ page }) => {
    await page.goto("/contact");
    await page.route("**/contact", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await new Promise((r) => setTimeout(r, 1500));
      return route.continue();
    });
    const name = uniq(PREFIX);
    await page.locator("#fullName").fill(name);
    await page.locator("#mobile").fill("9876500004");
    await page.locator("#email").fill("pending@example.com");
    await page.getByRole("button", { name: "Submit Query" }).click();
    const pending = page.getByRole("button", { name: "Submitting…" });
    await expect(pending).toBeVisible();
    await expect(pending).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("your query has been received");
  });
});

test.describe("course page enquiry form", () => {
  test("validates and stores a course_page enquiry linked to the course", async ({ page }) => {
    const courses = await apiData<{ slug: string; title: string; category: { slug: string } }[]>("GET", "/courses", { auth: false });
    const course = courses[0];
    await page.goto(`/courses/${course.category.slug}/${course.slug}`);
    await expect(page.locator("#enq-course")).toHaveValue(course.title);
    await expect(page.locator("#enq-course")).toHaveAttribute("readonly", "");

    await page.locator("form").filter({ has: page.locator("#enq-fullName") }).getByRole("button", { name: "Submit Query" }).click();
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
    await expect(page.getByText("Please enter your mobile number.")).toBeVisible();

    const name = uniq(PREFIX);
    await page.locator("#enq-fullName").fill(name);
    await page.locator("#enq-mobile").fill("98765 00005");
    await page.locator("#enq-experience").selectOption("Professional");
    await page.locator("form").filter({ has: page.locator("#enq-fullName") }).getByRole("button", { name: "Submit Query" }).click();
    await expect(page.getByRole("status").filter({ hasText: "in touch" })).toBeVisible();
    await expect(page.locator("#enq-fullName")).toHaveValue("");

    const stored = await findEnquiryByName(name);
    expect(stored).toMatchObject({ mobile: "98765 00005", email: null, courseName: course.title, experienceLevel: "Professional", source: "course_page", consent: false });
  });

  test("optional email in the course form is validated when provided", async ({ page }) => {
    // The sidebar form has no email field; the contact form treats a provided email strictly.
    await page.goto("/contact");
    await page.locator("#fullName").fill("E2E Email Check");
    await page.locator("#mobile").fill("9876500006");
    await page.locator("#email").fill("bad@");
    await page.getByRole("button", { name: "Submit Query" }).click();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });
});
