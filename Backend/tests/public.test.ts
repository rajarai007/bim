import { describe, expect, it } from "vitest";
import { api } from "./helpers";
import { pool } from "../src/config/database";

describe("public API", () => {
  it("GET /health reports database status", async () => {
    const res = await api().get("/health");
    expect(res.status).toBe(200);
    expect(res.body.data.database).toBe("connected");
  });

  it("returns 404 in the standard envelope for unknown routes", async () => {
    const res = await api().get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, errors: [] });
  });

  it("GET /settings returns only public settings", async () => {
    const res = await api().get("/api/v1/settings");
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: expect.any(String),
      contact: { phone: expect.any(String), email: expect.any(String), address: expect.any(String) },
      social: expect.any(Object),
    });
    expect(res.body.data).not.toHaveProperty("webhookUrl");
  });

  it("GET /pages returns SEO meta for the site pages", async () => {
    const res = await api().get("/api/v1/pages");
    expect(res.status).toBe(200);
    expect(res.body.data.map((p: { path: string }) => p.path)).toEqual(expect.arrayContaining(["/", "/courses", "/about", "/contact"]));
  });

  it("GET /categories lists active categories with course counts", async () => {
    const res = await api().get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data[0]).toMatchObject({ slug: "bim-digital-construction", badge: "BIM", icon: "box", courseCount: 16 });
  });

  it("GET /categories/:slug returns one category or 404", async () => {
    expect((await api().get("/api/v1/categories/structural-design")).body.data.name).toBe("Structural Design");
    expect((await api().get("/api/v1/categories/nope")).status).toBe(404);
  });

  it("GET /courses lists active courses, filterable by category and featured", async () => {
    const all = await api().get("/api/v1/courses");
    expect(all.status).toBe(200);
    expect(all.body.data.length).toBe(30);
    expect(all.body.data[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
      badge: expect.any(String),
      duration: expect.stringMatching(/Month/),
      image: { src: expect.stringMatching(/^\/images\//), alt: expect.any(String) },
      category: { slug: expect.any(String) },
    });

    const mep = await api().get("/api/v1/courses?category=mep-design");
    expect(mep.body.data).toHaveLength(5);
    expect(mep.body.data.every((c: { category: { slug: string } }) => c.category.slug === "mep-design")).toBe(true);

    const featured = await api().get("/api/v1/courses?featured=true");
    expect(featured.body.data.map((c: { slug: string }) => c.slug).sort()).toEqual(
      ["3ds-max-master", "autocad-drafting", "navisworks-coordination", "revit-architecture", "revit-mep-master", "staad-pro"],
    );
  });

  it("GET /courses rejects an invalid featured flag", async () => {
    const res = await api().get("/api/v1/courses?featured=maybe");
    expect(res.status).toBe(422);
  });

  it("GET /courses/:slug returns the full detail with related courses", async () => {
    const res = await api().get("/api/v1/courses/revit-architecture");
    expect(res.status).toBe(200);
    const course = res.body.data;
    expect(course.detail.modules).toHaveLength(6);
    expect(course.detail.outcomes.length).toBeGreaterThan(0);
    expect(course.detail.meta).toEqual({ duration: "3 Months", mode: "Offline Lab", admissions: "Okhla Center" });
    expect(course).toHaveProperty("syllabusUrl", null);
    expect(course.related.length).toBeGreaterThan(0);
    expect(course.related.every((r: { slug: string }) => r.slug !== "revit-architecture")).toBe(true);
    expect(course.seo.title).toContain("Revit");
  });

  it("hides draft/inactive courses from the public API", async () => {
    await pool.query(`UPDATE courses SET status = 'draft' WHERE slug = 'rcc-design'`);
    try {
      expect((await api().get("/api/v1/courses/rcc-design")).status).toBe(404);
      const list = await api().get("/api/v1/courses?category=structural-design");
      expect(list.body.data.some((c: { slug: string }) => c.slug === "rcc-design")).toBe(false);
    } finally {
      await pool.query(`UPDATE courses SET status = 'active' WHERE slug = 'rcc-design'`);
    }
  });

  it("GET /trainers lists active trainers, optionally only home ones", async () => {
    const all = await api().get("/api/v1/trainers");
    expect(all.body.data).toHaveLength(8);
    expect(all.body.data[0]).toMatchObject({ experience: "12+ Years Experience", tags: expect.any(Array), image: { src: expect.any(String) } });
    const home = await api().get("/api/v1/trainers?home=true");
    expect(home.body.data).toHaveLength(4);
  });

  it("GET /testimonials returns only published testimonials", async () => {
    const res = await api().get("/api/v1/testimonials");
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0]).toMatchObject({ rating: 5, avatar: { src: expect.any(String) } });
  });

  it("GET /projects lists published projects and home showcase", async () => {
    const all = await api().get("/api/v1/projects");
    expect(all.body.data).toHaveLength(8);
    expect(all.body.data[0].category.badge).toBe("BIM");
    const home = await api().get("/api/v1/projects?home=true");
    expect(home.body.data).toHaveLength(4);
  });

  it("GET /faq-categories and /faqs", async () => {
    const cats = await api().get("/api/v1/faq-categories");
    expect(cats.body.data).toHaveLength(5);
    const faqs = await api().get("/api/v1/faqs");
    expect(faqs.body.data).toHaveLength(17);
    expect(faqs.body.data[0].category).toMatchObject({ slug: "general", label: "General Queries" });
    const home = await api().get("/api/v1/faqs?home=true");
    expect(home.body.data).toHaveLength(5);
  });

  describe("POST /enquiries", () => {
    it("rejects an invalid payload with field errors", async () => {
      const res = await api().post("/api/v1/enquiries").send({ fullName: "", mobile: "12", email: "bad" });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      const fields = res.body.errors.map((e: { field: string }) => e.field);
      expect(fields).toEqual(expect.arrayContaining(["fullName", "mobile", "email"]));
    });

    it("rejects an unknown course slug", async () => {
      const res = await api().post("/api/v1/enquiries").send({ fullName: "Test", mobile: "+91 98765 43210", courseSlug: "does-not-exist" });
      expect(res.status).toBe(422);
      expect(res.body.errors[0].field).toBe("courseSlug");
    });

    it("rejects malformed JSON", async () => {
      const res = await api().post("/api/v1/enquiries").set("Content-Type", "application/json").send("{bad json");
      expect(res.status).toBe(400);
    });

    it("stores a valid enquiry and links it to the course", async () => {
      const res = await api().post("/api/v1/enquiries").send({
        fullName: "Test Student",
        mobile: "+91 98765 43210",
        email: "Student@Example.com",
        courseSlug: "staad-pro",
        qualification: "B.Tech Civil",
        experience: "Fresher",
        message: "Weekend batch?",
        consent: true,
        source: "contact_form",
      });
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ id: expect.any(Number), status: "new" });

      const { rows } = await pool.query(`SELECT * FROM enquiries WHERE id = $1`, [res.body.data.id]);
      expect(rows[0]).toMatchObject({
        full_name: "Test Student",
        email: "student@example.com",
        course_name: "STAAD.Pro (Structural Analysis)",
        experience_level: "Fresher",
        consent: true,
        status: "new",
      });
      expect(rows[0].course_id).toBeGreaterThan(0);
    });

    it("accepts the syllabus-download popup (name, mobile, email)", async () => {
      const res = await api().post("/api/v1/enquiries").send({
        fullName: "Syllabus Lead",
        mobile: "9876543211",
        email: "syllabus@example.com",
        courseSlug: "revit-architecture",
        source: "syllabus_download",
      });
      expect(res.status).toBe(201);
      const { rows } = await pool.query(`SELECT source, course_name FROM enquiries WHERE id = $1`, [res.body.data.id]);
      expect(rows[0]).toMatchObject({ source: "syllabus_download", course_name: expect.any(String) });
    });

    it("accepts the compact course-page form (no email)", async () => {
      const res = await api().post("/api/v1/enquiries").send({
        fullName: "Sidebar Lead",
        mobile: "9876543210",
        courseSlug: "revit-architecture",
        experience: "",
        source: "course_page",
      });
      expect(res.status).toBe(201);
    });
  });
});
