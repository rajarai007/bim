/**
 * The "B" emblem as raw pixels for generated PDFs, decoded once per process.
 * `next.config.ts` traces the file into serverless bundles; if it is still
 * missing, the image is fetched from the site itself, which always serves it.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { brand } from "@/components/icons/logo";
import { decodePng, downscale, type RgbImage } from "@/lib/png";

/** 48pt in the letterhead at 4× is plenty for print, and keeps the PDF small. */
const MAX_PIXELS = 192;

let cached: Promise<RgbImage | null> | undefined;

async function readMark(origin: string | undefined): Promise<Uint8Array> {
  try {
    return await readFile(path.join(process.cwd(), "public", brand.mark));
  } catch (err) {
    if (!origin) throw err;
    const res = await fetch(new URL(brand.mark, origin), { cache: "force-cache" });
    if (!res.ok) throw new Error(`${res.status} fetching ${brand.mark}`);
    return new Uint8Array(await res.arrayBuffer());
  }
}

/** Resolves to null (and logs) when the logo cannot be loaded, so a PDF is still produced. */
export function loadBrandMark(origin?: string): Promise<RgbImage | null> {
  cached ??= readMark(origin)
    .then((bytes) => downscale(decodePng(bytes), MAX_PIXELS))
    .catch((err: unknown) => {
      console.error("[brand-logo] generating PDFs without the logo:", (err as Error).message);
      cached = undefined; // retry on the next request
      return null;
    });
  return cached;
}
