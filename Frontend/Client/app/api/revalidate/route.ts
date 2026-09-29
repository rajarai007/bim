import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_CACHE_TAG } from "@/lib/api";

/**
 * Called by the backend after every successful admin write, so edits show up
 * on the next visit instead of after the ISR window. Authenticated with the
 * shared `REVALIDATE_SECRET` (set the same value on the API); without it the
 * endpoint refuses everything and pages still refresh every minute.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || !safeEqual(given, secret)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  // Expire (not just mark stale) so the admin's next page load shows the edit.
  revalidateTag(CONTENT_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
