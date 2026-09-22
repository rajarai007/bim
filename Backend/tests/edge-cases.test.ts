import { describe, expect, it, beforeAll } from "vitest";
import { api, authed } from "./helpers";
import { pool } from "../src/config/database";

/**
 * Request-shape and boundary cases across the whole API: authentication on
 * every admin route, malformed bodies, invalid ids, query limits, injection
 * attempts and constraint fallbacks.
 */
let auth: Record<string, string>;
beforeAll(async () => {
  auth = (await authed()).auth;
});

const adminRoutes: [string, string][] = [
  ["get", "/admin/dashboard"],
  ["get", "/admin/courses"], ["post", "/admin/courses"], ["get", "/admin/courses/1"], ["put", "/admin/courses/1"], ["patch", "/admin/courses/1/featured"], ["delete", "/admin/courses/1"],
  ["get", "/admin/categories"], ["post", "/admin/categories"], ["get", "/admin/categories/1"], ["put", "/admin/categories/1"], ["delete", "/admin/categories/1"],
  ["get", "/admin/trainers"], ["post", "/admin/trainers"], ["get", "/admin/trainers/1"], ["put", "/admin/trainers/1"], ["delete", "/admin/trainers/1"],
  ["get", "/admin/testimonials"], ["post", "/admin/testimonials"], ["get", "/admin/testimonials/1"], ["put", "/admin/testimonials/1"], ["delete", "/admin/testimonials/1"],
  ["get", "/admin/projects"], ["post", "/admin/projects"], ["get", "/admin/projects/1"], ["put", "/admin/projects/1"], ["delete", "/admin/projects/1"],
  ["get", "/admin/faqs"], ["post", "/admin/faqs"], ["get", "/admin/faqs/1"], ["put", "/admin/faqs/1"], ["delete", "/admin/faqs/1"],
  ["get", "/admin/enquiries"], ["get", "/admin/enquiries/stats"], ["get", "/admin/enquiries/export"], ["get", "/admin/enquiries/1"], ["patch", "/admin/enquiries/1/status"], ["post", "/admin/enquiries/1/notes"], ["delete", "/admin/enquiries/1"],
  ["get", "/admin/settings"], ["patch", "/admin/settings"], ["get", "/admin/pages"], ["patch", "/admin/pages/1"],
  ["get", "/admin/media"], ["post", "/admin/media"], ["delete", "/admin/media/1"],
  ["get", "/auth/me"], ["patch", "/auth/me"], ["patch", "/auth/password"],
];

type Method = "get" | "post" | "put" | "patch" | "delete";
const call = (method: string, path: string) => api()[method as Method](`/api/v1${path}`);

describe("authentication on every protected route", () => {
  it("returns 401 without a token, with a malformed token and with a lowercase scheme", async () => {
    for (const [method, path] of adminRoutes) {
      expect((await call(method, path)).status, `${method} ${path}`).toBe(401);
      expect((await call(method, path).set("Authorization", "Bearer not.a.jwt")).status, `${method} ${path} bad token`).toBe(401);
    }
    const token = auth.Authorization!.slice("Bearer ".length);
    expect((await api().get("/api/v1/admin/dashboard").set("Authorization", `bearer ${token}`)).status).toBe(401);
    expect((await api().get("/api/v1/admin/dashboard").set("Authorization", "Bearer ")).status).toBe(401);
  });

  it("authenticates before matching unknown admin routes", async () => {
    expect((await api().get("/api/v1/admin/nope")).status).toBe(401);
    expect((await api().get("/api/v1/admin/nope").set(auth)).status).toBe(404);
  });
});

describe("request bodies", () => {
  it("maps body-parser failures onto the JSON envelope instead of a 500", async () => {
    const tooLarge = await api().post("/api/v1/enquiries").set("Content-Type", "application/json").send(JSON.stringify({ fullName: "Big", mobile: "9876543210", message: "x".repeat(1_100_000) }));
    expect(tooLarge.status).toBe(413);
    expect(tooLarge.body).toMatchObject({ success: false, message: "Request body is too large", errors: [] });

    const badEncoding = await api().post("/api/v1/enquiries").set("Content-Type", "application/json").set("Content-Encoding", "bogus").send("{}");
    expect(badEncoding.status).toBe(415);
    expect(badEncoding.body.success).toBe(false);

    const malformed = await api().post("/api/v1/enquiries").set("Content-Type", "application/json").send("{bad");
    expect(malformed.status).toBe(400);
    expect(malformed.body.message).toBe("Malformed JSON body");
    expect((await api().post("/api/v1/enquiries").set("Content-Type", "application/json").send("null")).status).toBe(400);
  });

  it("rejects wrong value types with 422 field errors", async () => {
    const cases: [Method, string, unknown][] = [
      ["post", "/api/v1/admin/courses", { categoryId: "abc", slug: 123, title: {}, shortDescription: [], durationWeeks: "x" }],
      ["post", "/api/v1/admin/trainers", { name: "T", role: "R", bio: "B", experienceYears: "five", showOnHome: "yes" }],
      ["post", "/api/v1/admin/testimonials", { name: "N", program: "P", quote: "Q", rating: "five" }],
      ["post", "/api/v1/admin/faqs", { faqCategoryId: "a", question: 1, answer: 2 }],
      ["patch", "/api/v1/admin/enquiries/1/status", { status: 1 }],
      ["post", "/api/v1/admin/enquiries/1/notes", { note: 123 }],
      ["patch", "/api/v1/admin/settings", { email: 123 }],
      ["patch", "/api/v1/admin/settings", { gaMeasurementId: "x".repeat(41) }],
      ["patch", "/api/v1/admin/settings", { gaMeasurementId: "</script><script>alert(1)</script>" }],
      ["patch", "/api/v1/admin/settings", { gaMeasurementId: "not-an-id" }],
      ["patch", "/api/v1/admin/settings", { logoUrl: "javascript:alert(1)" }],
      ["patch", "/api/v1/admin/courses/1/featured", {}],
      ["post", "/api/v1/enquiries", { fullName: 123, mobile: 9876543210 }],
      ["post", "/api/v1/enquiries", { fullName: "Ok Name", mobile: "9876543210", consent: "true" }],
      ["post", "/api/v1/enquiries", { fullName: "Ok Name", mobile: "9876543210", source: "telepathy" }],
      ["post", "/api/v1/enquiries", { fullName: "Ok Name", mobile: "9876543210", experience: "Guru" }],
      ["post", "/api/v1/auth/login", { email: "admin@bimcareeracademy.com", password: "admin123", remember: "yes" }],
      ["post", "/api/v1/enquiries", [1, 2]],
    ];
    for (const [method, path, body] of cases) {
      const res = await api()[method](path).set(auth).send(body as object);
      expect(res.status, `${method} ${path} ${JSON.stringify(body)}`).toBe(422);
      expect(res.body.success).toBe(false);
    }
  });

  it("normalises a valid Google measurement id", async () => {
    const res = await api().patch("/api/v1/admin/settings").set(auth).send({ gaMeasurementId: "g-abc123" });
    expect(res.status).toBe(200);
    expect(res.body.data.gaMeasurementId).toBe("G-ABC123");
    expect((await api().get("/api/v1/settings")).body.data.gaMeasurementId).toBe("G-ABC123");
    await api().patch("/api/v1/admin/settings").set(auth).send({ gaMeasurementId: null });
  });

  it("strips unknown fields instead of failing", async () => {
    const course = (await api().get("/api/v1/admin/courses?pageSize=1").set(auth)).body.data.items[0];
    const res = await api().put(`/api/v1/admin/courses/${course.id}`).set(auth).send({ ...course, bogus: "x", id: 999999 });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(course.id);
    expect((await api().patch("/api/v1/admin/settings").set(auth).send({ bogus: 1 })).status).toBe(422);
  });

  it("accepts url-encoded enquiry submissions", async () => {
    const res = await api().post("/api/v1/enquiries").type("form").send({ fullName: "Form User", mobile: "9876543210" });
    expect(res.status).toBe(201);
    await api().delete(`/api/v1/admin/enquiries/${res.body.data.id}`).set(auth);
  });
});

describe("path and query parameters", () => {
  it("rejects non-positive-integer ids on every resource with 422", async () => {
    for (const path of ["/admin/courses/abc", "/admin/courses/-1", "/admin/courses/1.5", "/admin/courses/0", "/admin/categories/x", "/admin/trainers/x", "/admin/testimonials/x", "/admin/projects/x", "/admin/faqs/x", "/admin/enquiries/x"]) {
      expect((await api().get(`/api/v1${path}`).set(auth)).status, path).toBe(422);
    }
    expect((await api().delete("/api/v1/admin/media/x").set(auth)).status).toBe(422);
    expect((await api().patch("/api/v1/admin/pages/x").set(auth).send({})).status).toBe(422);
  });

  it("validates pagination and filters", async () => {
    for (const [qs, status] of [["page=0", 422], ["page=abc", 422], ["pageSize=1000", 422], ["pageSize=0", 422], ["status=", 422], ["q=" + "x".repeat(121), 422], ["page=99999", 200], ["category=", 200]] as const) {
      expect((await api().get(`/api/v1/admin/courses?${qs}`).set(auth)).status, qs).toBe(status);
    }
    const beyond = await api().get("/api/v1/admin/courses?page=99999").set(auth);
    expect(beyond.body.data.items).toEqual([]);
    expect(beyond.body.data.pagination.page).toBe(99999);
    for (const [qs, status] of [["days=0", 422], ["days=-1", 422], ["days=abc", 422], ["days=3651", 422], ["days=7", 200], ["status=new&course=revit&days=30&q=a", 200]] as const) {
      expect((await api().get(`/api/v1/admin/enquiries?${qs}`).set(auth)).status, qs).toBe(status);
    }
    expect((await api().get("/api/v1/admin/enquiries/export?status=bogus").set(auth)).status).toBe(422);
  });

  it("neutralises SQL and LIKE wildcards in search input", async () => {
    const inj = await api().get(`/api/v1/admin/courses?q=${encodeURIComponent("'; DROP TABLE courses; --")}`).set(auth);
    expect(inj.status).toBe(200);
    expect(inj.body.data.items).toEqual([]);
    expect((await pool.query("SELECT count(*)::int AS c FROM courses")).rows[0].c).toBeGreaterThan(0);

    const wildcard = await api().get(`/api/v1/admin/courses?q=${encodeURIComponent("%")}`).set(auth);
    expect(wildcard.body.data.items).toEqual([]);
    const underscore = await api().get(`/api/v1/admin/enquiries?q=${encodeURIComponent("_")}`).set(auth);
    expect(underscore.body.data.items.every((e: { fullName: string; email: string | null; mobile: string }) => /_/.test(`${e.fullName}${e.email}${e.mobile}`))).toBe(true);

    expect((await api().get(`/api/v1/courses/${encodeURIComponent("' OR 1=1 --")}`)).status).toBe(404);
    expect((await api().get(`/api/v1/courses?category=${encodeURIComponent("' OR '1'='1")}`)).body.data).toEqual([]);
  });
});

describe("constraints and visibility", () => {
  it("translates a unique-constraint race into a 409 naming the field", async () => {
    const { rows } = await pool.query<{ id: number }>("SELECT id FROM categories LIMIT 1");
    const body = { categoryId: rows[0]!.id, slug: "race-course", title: "Race", shortDescription: "s", durationWeeks: 4 };
    const race = await Promise.all([1, 2, 3, 4].map(() => api().post("/api/v1/admin/courses").set(auth).send(body)));
    const statuses = race.map((r) => r.status).sort();
    expect(statuses[0]).toBe(201);
    expect(statuses.slice(1).every((s) => s === 409)).toBe(true);
    for (const r of race.filter((r) => r.status === 409)) expect(r.body.errors[0].field).toBe("slug");
    const created = race.find((r) => r.status === 201)!;
    await api().delete(`/api/v1/admin/courses/${created.body.data.id}`).set(auth);
  });

  it("renaming a category to an existing slug is a 409 with the slug field", async () => {
    const cats = (await api().get("/api/v1/admin/categories").set(auth)).body.data;
    const res = await api().put(`/api/v1/admin/categories/${cats[1].id}`).set(auth).send({ ...cats[1], slug: cats[0].slug });
    expect(res.status).toBe(409);
    expect(res.body.errors[0].field).toBe("slug");
  });

  it("hides a course whose category is inactive from the public detail endpoint too", async () => {
    const cats = (await api().get("/api/v1/admin/categories").set(auth)).body.data;
    const cat = cats.find((c: { slug: string }) => c.slug === "interior-design-software");
    const course = (await api().get(`/api/v1/courses?category=${cat.slug}`)).body.data[0];
    expect((await api().put(`/api/v1/admin/categories/${cat.id}`).set(auth).send({ ...cat, status: "inactive" })).status).toBe(200);
    try {
      expect((await api().get(`/api/v1/courses/${course.slug}`)).status).toBe(404);
      expect((await api().get("/api/v1/courses")).body.data.some((c: { id: number }) => c.id === course.id)).toBe(false);
      expect((await api().get("/api/v1/projects")).body.data.some((p: { category: { id: number } }) => p.category.id === cat.id)).toBe(false);
      // Existing enquiries may still reference the course.
      const enq = await api().post("/api/v1/enquiries").send({ fullName: "Inactive Cat", mobile: "9876543210", courseSlug: course.slug });
      expect(enq.status).toBe(201);
      await api().delete(`/api/v1/admin/enquiries/${enq.body.data.id}`).set(auth);
    } finally {
      await api().put(`/api/v1/admin/categories/${cat.id}`).set(auth).send({ ...cat, status: "active" });
    }
    expect((await api().get(`/api/v1/courses/${course.slug}`)).status).toBe(200);
  });

  it("seeds a site_pages row for every public page that reads SEO meta", async () => {
    const paths = (await api().get("/api/v1/pages")).body.data.map((p: { path: string }) => p.path);
    for (const p of ["/", "/courses", "/about", "/contact", "/trainers", "/projects", "/faq", "/privacy-policy"]) expect(paths).toContain(p);
  });

  it("enforces enquiry field boundaries", async () => {
    const post = (body: object) => api().post("/api/v1/enquiries").send(body);
    for (const [mobile, status] of [["123456789", 422], ["1234567890", 201], ["+91 98765 43210", 201], ["+91-98765-43210", 201], ["12345678901234567", 422], ["abcdefghij", 422], ["  9876543210  ", 201]] as const) {
      const res = await post({ fullName: "Boundary User", mobile });
      expect(res.status, mobile).toBe(status);
      if (res.status === 201) await api().delete(`/api/v1/admin/enquiries/${res.body.data.id}`).set(auth);
    }
    expect((await post({ fullName: "A", mobile: "9876543210" })).status).toBe(422);
    expect((await post({ fullName: "A".repeat(121), mobile: "9876543210" })).status).toBe(422);
    expect((await post({ fullName: "Long", mobile: "9876543210", message: "m".repeat(4001) })).status).toBe(422);
    expect((await post({ fullName: "Long", mobile: "9876543210", qualification: "q".repeat(161) })).status).toBe(422);
    const max = await post({ fullName: "A".repeat(120), mobile: "9876543210" });
    expect(max.status).toBe(201);
    await api().delete(`/api/v1/admin/enquiries/${max.body.data.id}`).set(auth);
  });

  it("enforces course field boundaries", async () => {
    const { rows } = await pool.query<{ id: number }>("SELECT id FROM categories LIMIT 1");
    const base = { categoryId: rows[0]!.id, slug: "boundary-course", title: "Probe", shortDescription: "S", durationWeeks: 4 };
    const post = (body: object) => api().post("/api/v1/admin/courses").set(auth).send(body);
    expect((await post({ ...base, slug: "Probe" })).status).toBe(422);
    expect((await post({ ...base, slug: "a" })).status).toBe(422);
    expect((await post({ ...base, durationWeeks: 105 })).status).toBe(422);
    expect((await post({ ...base, durationWeeks: 1.5 })).status).toBe(422);
    expect((await post({ ...base, syllabus: Array.from({ length: 51 }, (_, i) => ({ title: `M${i}` })) })).status).toBe(422);
    expect((await post({ ...base, syllabus: [{ description: "x" }] })).status).toBe(422);
    expect((await post({ ...base, imageUrl: "javascript:alert(1)" })).status).toBe(422);
    expect((await post({ ...base, imageUrl: "data:text/html,x" })).status).toBe(422);
    expect((await post({ ...base, title: "t".repeat(161) })).status).toBe(422);
    expect((await post({ ...base, trainingMode: "" })).status).toBe(422);
    expect((await post({ ...base, status: "live" })).status).toBe(422);
    const minimal = await post(base);
    expect(minimal.status).toBe(201);
    expect(minimal.body.data).toMatchObject({ status: "draft", trainingMode: "Offline & Online", isFeatured: false, outcomes: [], syllabus: [] });
    await api().delete(`/api/v1/admin/courses/${minimal.body.data.id}`).set(auth);
  });
});

describe("security headers and static files", () => {
  it("sets helmet headers, hides x-powered-by and restricts CORS to configured origins", async () => {
    const res = await api().get("/api/v1/settings").set("Origin", "http://localhost:3000");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    const evil = await api().get("/api/v1/settings").set("Origin", "http://evil.example");
    expect(evil.headers["access-control-allow-origin"]).toBeUndefined();
    const preflight = await api().options("/api/v1/enquiries").set("Origin", "http://localhost:3000").set("Access-Control-Request-Method", "POST");
    expect([200, 204]).toContain(preflight.status);
  });

  it("serves seeded images cross-origin and blocks path traversal", async () => {
    const img = await api().get("/images/avatar-admin.png");
    expect(img.status).toBe(200);
    expect(img.headers["cross-origin-resource-policy"]).toBe("cross-origin");
    expect((await api().get("/images/..%2fpackage.json")).status).toBe(404);
    expect((await api().get("/uploads/..%2f.env")).status).toBe(404);
    expect((await api().get("/uploads/../.env")).status).toBe(404);
  });

  it("never exposes password hashes or the webhook URL publicly", async () => {
    expect(JSON.stringify((await api().get("/api/v1/auth/me").set(auth)).body)).not.toMatch(/password|\$2a\$/);
    expect(JSON.stringify((await api().get("/api/v1/admin/dashboard").set(auth)).body)).not.toContain("$2a$");
    expect((await api().get("/api/v1/settings")).body.data).not.toHaveProperty("webhookUrl");
  });
});
