import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

/**
 * /robots.txt. Every public page is crawlable, including `/_next/*` (the CSS, JS
 * and optimized images Google needs to render pages). Only the cache-revalidation
 * webhook is kept out; the admin console and the API live on other hosts and
 * send their own `noindex` headers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
