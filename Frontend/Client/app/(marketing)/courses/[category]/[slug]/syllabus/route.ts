import type { NextRequest } from "next/server";
import { getCourseBySlug } from "@/features/courses/service";
import { API_URL, ApiError } from "@/lib/api";

/**
 * Streams the course's syllabus PDF as a download with a readable file name.
 * Like every other page, this goes through the API server-side so the browser
 * never has to reach the API origin directly.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/courses/[category]/[slug]/syllabus">) {
  const { category, slug } = await ctx.params;

  let source: string | null = null;
  try {
    const course = await getCourseBySlug(slug);
    if (course && course.category.slug === category && course.syllabusUrl) {
      source = /^https?:\/\//.test(course.syllabusUrl) ? course.syllabusUrl : `${API_URL}${course.syllabusUrl}`;
    }
  } catch (err) {
    if (err instanceof ApiError) return new Response("Syllabus is temporarily unavailable", { status: 503 });
    throw err;
  }
  if (!source) return new Response("Syllabus not available", { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(source, { cache: "no-store" });
  } catch {
    return new Response("Syllabus is temporarily unavailable", { status: 503 });
  }
  if (!upstream.ok || !upstream.body) return new Response("Syllabus not available", { status: 404 });

  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
    "Content-Disposition": `attachment; filename="${slug}-syllabus.pdf"`,
    // The download URL is stable per course while the file behind it can be replaced in the admin console.
    "Cache-Control": "no-store",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);
  return new Response(upstream.body, { headers });
}
