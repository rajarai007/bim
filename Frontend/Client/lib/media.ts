import type { ImageAsset } from "@/types";

const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Neutral placeholder shipped with the site for records without an image. */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

/** Turns an API-relative media path (`/images/x.png`, `/uploads/…`) into an absolute URL. */
export function mediaUrl(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  return `${MEDIA_ORIGIN}${src.startsWith("/") ? src : `/${src}`}`;
}

/** Resolves an API image (possibly null) into a renderable asset. */
export function resolveImage(image: { src: string; alt: string } | null | undefined, fallbackAlt: string): ImageAsset {
  if (!image) return { src: PLACEHOLDER_IMAGE, alt: fallbackAlt };
  return { src: mediaUrl(image.src), alt: image.alt || fallbackAlt };
}
