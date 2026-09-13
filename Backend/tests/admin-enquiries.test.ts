import { describe, expect, it, beforeAll } from "vitest";
import { api, authed } from "./helpers";

let auth: Record<string, string>;
beforeAll(async () => {
  auth = (await authed()).auth;
});

describe("admin enquiries", () => {
  let enquiryId: number;

  beforeAll(async () => {
    const res = await api().post("/api/v1/enquiries").send({
      fullName: "Enquiry Test",
      mobile: "+91 90000 00000",
      email: "enquiry.test@example.com",
      courseSlug: "revit-architecture",
      qualification: "B.Arch",
      message: "Hello",
      consent: true,
    });
    enquiryId = res.body.data.id;
  });

  it("requires auth", async () => {
    expect((await api().get("/api/v1/admin/enquiries")).status).toBe(401);
  });

  it("lists enquiries newest-first with pagination and filters", async () => {
    const res = await api().get("/api/v1/admin/enquiries?pageSize=5").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(5);
    expect(res.body.data.pagination.total).toBeGreaterThan(5);
    expect(res.body.data.items[0]).toMatchObject({ id: expect.any(Number), fullName: expect.any(String), status: expect.any(String), createdAt: expect.any(String) });

    const search = await api().get("/api/v1/admin/enquiries?q=enquiry.test").set(auth);
    expect(search.body.data.items).toHaveLength(1);
    expect(search.body.data.items[0].id).toBe(enquiryId);

    const byStatus = await api().get("/api/v1/admin/enquiries?status=converted").set(auth);
    expect(byStatus.body.data.items.every((e: { status: string }) => e.status === "converted")).toBe(true);

    const byCourse = await api().get("/api/v1/admin/enquiries?course=revit").set(auth);
    expect(byCourse.body.data.items.every((e: { courseName: string }) => /revit/i.test(e.courseName))).toBe(true);

    const recent = await api().get("/api/v1/admin/enquiries?days=1").set(auth);
    expect(recent.body.data.items.some((e: { id: number }) => e.id === enquiryId)).toBe(true);

    expect((await api().get("/api/v1/admin/enquiries?status=bogus").set(auth)).status).toBe(422);
  });

  it("returns lead stats", async () => {
    const res = await api().get("/api/v1/admin/enquiries/stats").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ total: expect.any(Number), new: expect.any(Number), inProgress: expect.any(Number), converted: expect.any(Number) });
    expect(res.body.data.total).toBeGreaterThanOrEqual(res.body.data.new);
  });

  it("updates status with validation", async () => {
    const bad = await api().patch(`/api/v1/admin/enquiries/${enquiryId}/status`).set(auth).send({ status: "won" });
    expect(bad.status).toBe(422);
    const res = await api().patch(`/api/v1/admin/enquiries/${enquiryId}/status`).set(auth).send({ status: "converted" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("converted");
    expect((await api().patch(`/api/v1/admin/enquiries/999999/status`).set(auth).send({ status: "lost" })).status).toBe(404);
  });

  it("adds notes and exposes the latest one", async () => {
    expect((await api().post(`/api/v1/admin/enquiries/${enquiryId}/notes`).set(auth).send({ note: "  " })).status).toBe(422);
    const res = await api().post(`/api/v1/admin/enquiries/${enquiryId}/notes`).set(auth).send({ note: "Called, will revert." });
    expect(res.status).toBe(201);
    expect(res.body.data.note).toMatchObject({ note: "Called, will revert.", adminName: expect.any(String) });
    expect(res.body.data.enquiry.latestNote.note).toBe("Called, will revert.");

    const detail = await api().get(`/api/v1/admin/enquiries/${enquiryId}`).set(auth);
    expect(detail.body.data.notes).toHaveLength(1);
    expect(detail.body.data.latestNote.note).toBe("Called, will revert.");
  });

  it("exports leads as CSV", async () => {
    const res = await api().get("/api/v1/admin/enquiries/export?q=enquiry.test").set(auth);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.headers["content-disposition"]).toMatch(/attachment/);
    const lines = res.text.split("\r\n");
    expect(lines[0]).toMatch(/^ID,Name,Phone,Email/);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("Enquiry Test");
  });

  it("deletes an enquiry (and cascades its notes)", async () => {
    expect((await api().delete(`/api/v1/admin/enquiries/${enquiryId}`).set(auth)).status).toBe(200);
    expect((await api().get(`/api/v1/admin/enquiries/${enquiryId}`).set(auth)).status).toBe(404);
  });
});

describe("admin dashboard", () => {
  it("computes stats, trend, category split and recent enquiries", async () => {
    const res = await api().get("/api/v1/admin/dashboard").set(auth);
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(d.stats.map((s: { id: string }) => s.id)).toEqual(["total-courses", "active-courses", "total-enquiries", "new-enquiries"]);
    expect(d.stats[0].value).toBe(30);
    expect(d.stats[0].trend).toHaveLength(7);
    expect(d.trend).toHaveLength(7);
    expect(d.trend[6]).toMatchObject({ label: expect.any(String), value: expect.any(Number) });
    expect(d.byCategory.length).toBeGreaterThanOrEqual(4);
    expect(d.byCategoryTotal).toBeGreaterThan(0);
    expect(d.recentEnquiries.length).toBeLessThanOrEqual(6);
  });
});
