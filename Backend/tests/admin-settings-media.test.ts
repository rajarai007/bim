import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { api, authed } from "./helpers";

let auth: Record<string, string>;
beforeAll(async () => {
  auth = (await authed()).auth;
});

describe("admin settings", () => {
  it("reads and partially updates settings", async () => {
    const before = await api().get("/api/v1/admin/settings").set(auth);
    expect(before.status).toBe(200);
    expect(before.body.data).toMatchObject({ academyName: expect.any(String), email: expect.any(String) });

    const res = await api().patch("/api/v1/admin/settings").set(auth).send({ phone: "+91 11111 22222", instagramUrl: "https://instagram.com/bim" });
    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe("+91 11111 22222");
    expect(res.body.data.instagramUrl).toBe("https://instagram.com/bim");
    expect(res.body.data.academyName).toBe(before.body.data.academyName);

    const pub = await api().get("/api/v1/settings");
    expect(pub.body.data.contact.phone).toBe("+91 11111 22222");

    expect((await api().patch("/api/v1/admin/settings").set(auth).send({ email: "nope" })).status).toBe(422);
    expect((await api().patch("/api/v1/admin/settings").set(auth).send({ facebookUrl: "ftp://x" })).status).toBe(422);
    expect((await api().patch("/api/v1/admin/settings").set(auth).send({})).status).toBe(422);
    expect((await api().patch("/api/v1/admin/settings").send({ phone: "x" })).status).toBe(401);

    await api().patch("/api/v1/admin/settings").set(auth).send({ phone: before.body.data.phone, instagramUrl: before.body.data.instagramUrl });
  });

  it("lists pages and updates SEO meta", async () => {
    const pages = await api().get("/api/v1/admin/pages").set(auth);
    expect(pages.status).toBe(200);
    const home = pages.body.data.find((p: { path: string }) => p.path === "/");
    expect(home).toBeDefined();

    const res = await api().patch(`/api/v1/admin/pages/${home.id}`).set(auth).send({ metaTitle: "New Home Title", metaDescription: "Desc" });
    expect(res.status).toBe(200);
    expect(res.body.data.metaTitle).toBe("New Home Title");

    const pub = await api().get("/api/v1/pages");
    expect(pub.body.data.find((p: { path: string }) => p.path === "/").metaTitle).toBe("New Home Title");
    expect((await api().patch(`/api/v1/admin/pages/999999`).set(auth).send({ metaTitle: "x" })).status).toBe(404);
  });
});

describe("admin media", () => {
  it("lists seeded media with usage counts", async () => {
    const res = await api().get("/api/v1/admin/media").set(auth);
    expect(res.status).toBe(200);
    const revit = res.body.data.find((m: { url: string }) => m.url === "/images/course-revit-architecture.png");
    expect(revit).toMatchObject({ sizeBytes: expect.any(Number), usageCount: expect.any(Number) });
    expect(revit.usageCount).toBeGreaterThan(0);
  });

  it("uploads, serves and deletes an image; refuses non-images and in-use files", async () => {
    const file = path.resolve(__dirname, "../assets/images/person-01.png");
    const up = await api().post("/api/v1/admin/media").set(auth).attach("file", file);
    expect(up.status).toBe(201);
    expect(up.body.data).toMatchObject({ url: expect.stringMatching(/^\/uploads\/\d{4}\/\d{2}\/[a-f0-9]+\.png$/), mimeType: "image/png" });

    const served = await api().get(up.body.data.url);
    expect(served.status).toBe(200);
    expect(served.headers["content-type"]).toMatch(/image\/png/);

    const bad = await api().post("/api/v1/admin/media").set(auth).attach("file", Buffer.from("hello"), { filename: "x.txt", contentType: "text/plain" });
    expect(bad.status).toBe(422);
    expect((await api().post("/api/v1/admin/media").set(auth)).status).toBe(422);
    expect((await api().post("/api/v1/admin/media").attach("file", file)).status).toBe(401);

    const del = await api().delete(`/api/v1/admin/media/${up.body.data.id}`).set(auth);
    expect(del.status).toBe(200);
    expect((await api().get(up.body.data.url)).status).toBe(404);

    const list = await api().get("/api/v1/admin/media").set(auth);
    const inUse = list.body.data.find((m: { usageCount: number }) => m.usageCount > 0);
    const refused = await api().delete(`/api/v1/admin/media/${inUse.id}`).set(auth);
    expect(refused.status).toBe(409);
  });
});
