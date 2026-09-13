import { describe, expect, it, beforeAll } from "vitest";
import { api, authed } from "./helpers";
import { pool } from "../src/config/database";

let auth: Record<string, string>;
beforeAll(async () => {
  auth = (await authed()).auth;
});

describe("admin categories", () => {
  let id: number;

  it("lists categories with course counts", async () => {
    const res = await api().get("/api/v1/admin/categories").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data[0]).toMatchObject({ slug: "bim-digital-construction", courseCount: 16, status: "active" });
  });

  it("creates, updates and deletes a category", async () => {
    const body = {
      slug: "test-category",
      name: "Test Category",
      badge: "Test",
      summary: "Summary",
      tagline: "Tagline",
      description: "Description",
      icon: "layers",
      footerLabel: "Test",
      overviewTitle: "Test Category",
      status: "active",
    };
    const created = await api().post("/api/v1/admin/categories").set(auth).send(body);
    expect(created.status).toBe(201);
    id = created.body.data.id;
    expect(created.body.data.sortOrder).toBe(5);

    expect((await api().post("/api/v1/admin/categories").set(auth).send(body)).status).toBe(409);
    expect((await api().post("/api/v1/admin/categories").set(auth).send({ ...body, slug: "x", icon: "rocket" })).status).toBe(422);

    const updated = await api().put(`/api/v1/admin/categories/${id}`).set(auth).send({ ...body, name: "Renamed", status: "inactive" });
    expect(updated.body.data.name).toBe("Renamed");
    // inactive categories are hidden from the public API
    expect((await api().get("/api/v1/categories/test-category")).status).toBe(404);

    expect((await api().delete(`/api/v1/admin/categories/${id}`).set(auth)).status).toBe(200);
    expect((await api().get(`/api/v1/admin/categories/${id}`).set(auth)).status).toBe(404);
  });

  it("refuses to delete a category that still has courses", async () => {
    const { rows } = await pool.query<{ id: number }>(`SELECT id FROM categories WHERE slug = 'structural-design'`);
    const res = await api().delete(`/api/v1/admin/categories/${rows[0]!.id}`).set(auth);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/course/);
  });
});

describe("admin trainers", () => {
  const body = {
    name: "Test Trainer",
    role: "Tester",
    bio: "Bio",
    experienceYears: 5,
    tags: "A, B",
    imageUrl: "/images/person-01.png",
    linkedinUrl: "https://linkedin.com/in/test",
    showOnHome: true,
    status: "active",
  };

  it("supports full CRUD and search", async () => {
    const created = await api().post("/api/v1/admin/trainers").set(auth).send(body);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ tags: ["A", "B"], experience: "5+ Years" });
    const id = created.body.data.id;

    const list = await api().get("/api/v1/admin/trainers?q=test%20trainer").set(auth);
    expect(list.body.data).toHaveLength(1);

    const pub = await api().get("/api/v1/trainers?home=true");
    expect(pub.body.data.some((t: { id: number }) => t.id === id)).toBe(true);

    const updated = await api().put(`/api/v1/admin/trainers/${id}`).set(auth).send({ ...body, status: "inactive" });
    expect(updated.body.data.status).toBe("inactive");
    expect((await api().get("/api/v1/trainers")).body.data.some((t: { id: number }) => t.id === id)).toBe(false);

    expect((await api().put(`/api/v1/admin/trainers/${id}`).set(auth).send({ ...body, experienceYears: -1 })).status).toBe(422);
    expect((await api().delete(`/api/v1/admin/trainers/${id}`).set(auth)).status).toBe(200);
    expect((await api().delete(`/api/v1/admin/trainers/${id}`).set(auth)).status).toBe(404);
  });
});

describe("admin testimonials", () => {
  it("supports full CRUD with rating validation", async () => {
    const body = { name: "Student", program: "Program", quote: "Great!", rating: 4, avatarUrl: null, status: "pending" };
    expect((await api().post("/api/v1/admin/testimonials").set(auth).send({ ...body, rating: 6 })).status).toBe(422);

    const created = await api().post("/api/v1/admin/testimonials").set(auth).send(body);
    expect(created.status).toBe(201);
    const id = created.body.data.id;
    expect((await api().get("/api/v1/testimonials")).body.data.some((t: { id: number }) => t.id === id)).toBe(false);

    const published = await api().put(`/api/v1/admin/testimonials/${id}`).set(auth).send({ ...body, status: "published" });
    expect(published.body.data.status).toBe("published");
    expect((await api().get("/api/v1/testimonials")).body.data.some((t: { id: number }) => t.id === id)).toBe(true);

    expect((await api().delete(`/api/v1/admin/testimonials/${id}`).set(auth)).status).toBe(200);
    expect((await api().get(`/api/v1/admin/testimonials/${id}`).set(auth)).status).toBe(404);
  });
});

describe("admin projects", () => {
  it("supports full CRUD", async () => {
    const { rows } = await pool.query<{ id: number }>(`SELECT id FROM categories WHERE slug = 'interior-design-software'`);
    const body = { categoryId: rows[0]!.id, title: "Test Project", description: "Desc", software: ["Lumion"], imageUrl: "/images/project-luxury-lounge.png", showOnHome: false, status: "draft" };
    expect((await api().post("/api/v1/admin/projects").set(auth).send({ ...body, categoryId: 99999 })).status).toBe(422);

    const created = await api().post("/api/v1/admin/projects").set(auth).send(body);
    expect(created.status).toBe(201);
    expect(created.body.data.categoryBadge).toBe("Interior");
    const id = created.body.data.id;
    expect((await api().get("/api/v1/projects")).body.data.some((p: { id: number }) => p.id === id)).toBe(false);

    const updated = await api().put(`/api/v1/admin/projects/${id}`).set(auth).send({ ...body, status: "published", showOnHome: true });
    expect(updated.body.data.status).toBe("published");
    expect((await api().get("/api/v1/projects?home=true")).body.data.some((p: { id: number }) => p.id === id)).toBe(true);

    expect((await api().delete(`/api/v1/admin/projects/${id}`).set(auth)).status).toBe(200);
    expect((await api().delete(`/api/v1/admin/projects/${id}`).set(auth)).status).toBe(404);
  });
});

describe("admin faqs", () => {
  it("supports full CRUD", async () => {
    const { rows } = await pool.query<{ id: number }>(`SELECT id FROM faq_categories WHERE slug = 'general'`);
    const body = { faqCategoryId: rows[0]!.id, question: "Test question?", answer: "Test answer.", showOnHome: false, status: "draft" };
    expect((await api().post("/api/v1/admin/faqs").set(auth).send({ ...body, faqCategoryId: 999 })).status).toBe(422);

    const created = await api().post("/api/v1/admin/faqs").set(auth).send(body);
    expect(created.status).toBe(201);
    expect(created.body.data.categoryLabel).toBe("General Queries");
    const id = created.body.data.id;

    const search = await api().get("/api/v1/admin/faqs?q=test%20question").set(auth);
    expect(search.body.data).toHaveLength(1);

    const updated = await api().put(`/api/v1/admin/faqs/${id}`).set(auth).send({ ...body, status: "published", showOnHome: true });
    expect(updated.body.data.showOnHome).toBe(true);
    expect((await api().get("/api/v1/faqs?home=true")).body.data.some((f: { id: number }) => f.id === id)).toBe(true);

    expect((await api().delete(`/api/v1/admin/faqs/${id}`).set(auth)).status).toBe(200);
    expect((await api().get(`/api/v1/admin/faqs/${id}`).set(auth)).status).toBe(404);
  });
});
