import type { NextRequest } from "next/server";
import { getCourseBySlug } from "@/features/courses/service";
import { renderSyllabusPdf } from "@/features/courses/syllabus-pdf";
import { getSiteSettings } from "@/features/settings/service";
import { API_URL, ApiError } from "@/lib/api";
import { loadBrandMark } from "@/lib/brand-logo";

/**
 * Serves the course syllabus as a PDF download with a readable file name:
 * the PDF uploaded in the admin console when there is one, otherwise a PDF
 * generated from the course content itself. Like every other page, this goes
 * through the API server-side so the browser never has to reach the API
 * origin directly.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/courses/[category]/[slug]/syllabus">) {
  const { category, slug } = await ctx.params;

  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${slug}-syllabus.pdf"`,
    // The download URL is stable per course while the content behind it changes in the admin console.
    "Cache-Control": "no-store",
  });

  try {
    const course = await getCourseBySlug(slug);
    if (!course || course.category.slug !== category) return new Response("Syllabus not available", { status: 404 });

    if (!course.syllabusUrl) {
      const [site, logo] = await Promise.all([getSiteSettings(), loadBrandMark(req.nextUrl.origin)]);
      const pdf = renderSyllabusPdf(course, site, { logo, website: req.nextUrl.host });
      headers.set("Content-Length", String(pdf.byteLength));
      return new Response(pdf, { headers });
    }

    const source = /^https?:\/\//.test(course.syllabusUrl) ? course.syllabusUrl : `${API_URL}${course.syllabusUrl}`;
    let upstream: Response;
    try {
      upstream = await fetch(source, { cache: "no-store" });
    } catch {
      return new Response("Syllabus is temporarily unavailable", { status: 503 });
    }
    if (!upstream.ok || !upstream.body) return new Response("Syllabus not available", { status: 404 });

    headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/pdf");
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    return new Response(upstream.body, { headers });
  } catch (err) {
    if (err instanceof ApiError) return new Response("Syllabus is temporarily unavailable", { status: 503 });
    throw err;
  }
}
