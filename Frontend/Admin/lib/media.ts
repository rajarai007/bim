const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

/** Turns an API-relative media path (`/images/x.png`, `/uploads/…`) into an absolute URL. */
export function mediaUrl(src: string | null | undefined): string {
  if (!src) return PLACEHOLDER_IMAGE;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  return `${MEDIA_ORIGIN}${src.startsWith("/") ? src : `/${src}`}`;
}
