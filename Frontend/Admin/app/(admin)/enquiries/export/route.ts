import type { NextRequest } from "next/server";
import { adminFetchRaw } from "@/lib/api";

/** Streams the CSV export from the API using the admin's session (browsers can't send the bearer token). */
export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString();
  const upstream = await adminFetchRaw(`/admin/enquiries/export${qs ? `?${qs}` : ""}`);
  if (!upstream.ok) {
    return new Response("Export failed", { status: upstream.status });
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "text/csv; charset=utf-8",
      "Content-Disposition": upstream.headers.get("content-disposition") ?? 'attachment; filename="leads.csv"',
    },
  });
}
