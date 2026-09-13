import { describe, expect, it, beforeAll } from "vitest";
import { api, authed } from "./helpers";
import { pool } from "../src/config/database";

let auth: Record<string, string>;
let categoryId: number;

beforeAll(async () => {
  auth = (await authed()).auth;
  const { rows } = await pool.query<{ id: number }>(`SELECT id FROM categories WHERE slug = 'mep-design'`);
  categoryId = rows[0]!.id;
});

const validCourse = () => ({
  categoryId,
  slug: "test-plumbing-masterclass",
  title: "Plumbing Masterclass",
  shortDescription: "Short description for the test course.",
  fullDescription: "A longer description.",
  eligibility: "Anyone",
  whoShouldJoin: "Plumbers",
  outcomes: "Outcome A\nOutcome B",
  syllabus: [{ title: "Module 1", description: "Intro" }],
  software: "Revit MEP, AutoCAD",
  careers: ["Plumbing Designer"],
  durationWeeks: 8,
  trainingMode: "Offline Lab",
  batchLocation: "Noida Center",
  imageUrl: "/images/course-revit-mep.png",
  imageAlt: "MEP",
  status: "active",
  isFeatured: false,
  metaTitle: "Plumbing | BIM",
  metaDescription: "Meta",
});

describe("admin courses", () => {
  let createdId: number;

  it("requires authentication", async () => {
    expect((await api().get("/api/v1/admin/courses")).status).toBe(401);
    expect((await api().post("/api/v1/admin/courses").send(validCourse())).status).toBe(401);
  });

  it("lists courses with pagination, search and filters", async () => {
    const page1 = await api().get("/api/v1/admin/courses?page=1&pageSize=10").set(auth);
    expect(page1.status).toBe(200);
    expect(page1.body.data.items).toHaveLength(10);
    expect(page1.body.data.pagination).toEqual({ page: 1, pageSize: 10, total: 30, totalPages: 3 });
    expect(page1.body.data.items[0]).toMatchObject({ duration: expect.stringMatching(/Weeks/), durationOption: expect.stringMatching(/\(/), categoryName: expect.any(String) });

    const page3 = await api().get("/api/v1/admin/courses?page=3&pageSize=10").set(auth);
    expect(page3.body.data.items).toHaveLength(10);
    expect(page3.body.data.items[0].id).not.toBe(page1.body.data.items[0].id);

    const search = await api().get("/api/v1/admin/courses?q=revit").set(auth);
    expect(search.body.data.items.length).toBeGreaterThan(0);
    expect(search.body.data.items.every((c: { title: string }) => /revit/i.test(c.title))).toBe(true);

    const byCat = await api().get("/api/v1/admin/courses?category=interior-design-software&pageSize=50").set(auth);
    expect(byCat.body.data.items).toHaveLength(4);

    const bad = await api().get("/api/v1/admin/courses?status=bogus").set(auth);
    expect(bad.status).toBe(422);
  });

  it("validates course creation", async () => {
    const res = await api().post("/api/v1/admin/courses").set(auth).send({ title: "", slug: "Bad Slug!", durationWeeks: 0 });
    expect(res.status).toBe(422);
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["categoryId", "slug", "title", "shortDescription", "durationWeeks"]));
  });

  it("rejects an unknown category", async () => {
    const res = await api().post("/api/v1/admin/courses").set(auth).send({ ...validCourse(), categoryId: 99999 });
    expect(res.status).toBe(422);
    expect(res.body.errors[0]).toEqual({ field: "categoryId", message: "Category does not exist" });
  });

  it("creates a course", async () => {
    const res = await api().post("/api/v1/admin/courses").set(auth).send(validCourse());
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      slug: "test-plumbing-masterclass",
      outcomes: ["Outcome A", "Outcome B"],
      software: ["Revit MEP", "AutoCAD"],
      syllabus: [{ title: "Module 1", description: "Intro" }],
      duration: "8 Weeks",
      durationOption: "8 Weeks (2 Months)",
      categorySlug: "mep-design",
    });
    createdId = res.body.data.id;

    const { rows } = await pool.query(`SELECT * FROM courses WHERE id = $1`, [createdId]);
    expect(rows[0].software).toEqual(["Revit MEP", "AutoCAD"]);
    expect(rows[0].status).toBe("active");
  });

  it("rejects a duplicate slug", async () => {
    const res = await api().post("/api/v1/admin/courses").set(auth).send(validCourse());
    expect(res.status).toBe(409);
    expect(res.body.errors[0].field).toBe("slug");
  });

  it("reads a single course and 404s for a missing one", async () => {
    expect((await api().get(`/api/v1/admin/courses/${createdId}`).set(auth)).body.data.title).toBe("Plumbing Masterclass");
    expect((await api().get(`/api/v1/admin/courses/999999`).set(auth)).status).toBe(404);
    expect((await api().get(`/api/v1/admin/courses/abc`).set(auth)).status).toBe(422);
  });

  it("makes the new course visible on the public API", async () => {
    const res = await api().get("/api/v1/courses/test-plumbing-masterclass");
    expect(res.status).toBe(200);
    expect(res.body.data.detail.outcomes).toEqual(["Outcome A", "Outcome B"]);
  });

  it("updates a course", async () => {
    const res = await api().put(`/api/v1/admin/courses/${createdId}`).set(auth).send({ ...validCourse(), title: "Plumbing Masterclass v2", status: "draft" });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Plumbing Masterclass v2");
    expect(res.body.data.status).toBe("draft");
    // Draft courses disappear from the public site
    expect((await api().get("/api/v1/courses/test-plumbing-masterclass")).status).toBe(404);
  });

  it("refuses to update the slug to one that belongs to another course", async () => {
    const res = await api().put(`/api/v1/admin/courses/${createdId}`).set(auth).send({ ...validCourse(), slug: "staad-pro" });
    expect(res.status).toBe(409);
  });

  it("toggles the featured flag", async () => {
    const on = await api().patch(`/api/v1/admin/courses/${createdId}/featured`).set(auth).send({ isFeatured: true });
    expect(on.status).toBe(200);
    expect(on.body.data.isFeatured).toBe(true);
    const off = await api().patch(`/api/v1/admin/courses/${createdId}/featured`).set(auth).send({ isFeatured: false });
    expect(off.body.data.isFeatured).toBe(false);
    expect((await api().patch(`/api/v1/admin/courses/${createdId}/featured`).set(auth).send({ isFeatured: "yes" })).status).toBe(422);
    expect((await api().patch(`/api/v1/admin/courses/999999/featured`).set(auth).send({ isFeatured: true })).status).toBe(404);
  });

  it("deletes a course and detaches its enquiries", async () => {
    await api().put(`/api/v1/admin/courses/${createdId}`).set(auth).send({ ...validCourse(), status: "active" });
    const enquiry = await api().post("/api/v1/enquiries").send({ fullName: "Lead", mobile: "9999999999", courseSlug: "test-plumbing-masterclass" });
    expect(enquiry.status).toBe(201);

    const res = await api().delete(`/api/v1/admin/courses/${createdId}`).set(auth);
    expect(res.status).toBe(200);
    expect((await api().get(`/api/v1/admin/courses/${createdId}`).set(auth)).status).toBe(404);
    expect((await api().delete(`/api/v1/admin/courses/${createdId}`).set(auth)).status).toBe(404);

    const { rows } = await pool.query(`SELECT course_id, course_name FROM enquiries WHERE id = $1`, [enquiry.body.data.id]);
    expect(rows[0]).toEqual({ course_id: null, course_name: "Plumbing Masterclass" });
  });
});
