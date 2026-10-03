import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AmbientLight } from "@/components/motion/ambient-light";
import { Cursor } from "@/components/motion/cursor";
import { MotionProvider } from "@/components/motion/motion-provider";
import { getSiteSettings } from "@/features/settings/service";
import { siteConfig } from "@/lib/config";

// One variable family for headings and body alike; hierarchy comes from size
// and weight (medium display, semibold titles), not from a second typeface.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

/**
 * Pages are prerendered and served from the CDN; each is regenerated in the
 * background at most once a minute (and immediately after admin edits, see
 * app/api/revalidate). Must match CONTENT_REVALIDATE_SECONDS in lib/api.ts.
 */
export const revalidate = 60;

export const viewport: Viewport = {
  themeColor: "#f7f2e8",
  colorScheme: "light",
};

/**
 * Site-wide defaults. Each page adds its own title, description, canonical URL
 * and share tags through `buildMetadata` (lib/seo.ts); what is declared here
 * covers pages that set nothing, such as the 404 screen.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "education",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    images: [siteConfig.ogImage],
  },
  twitter: { card: "summary_large_image" },
  // Search Console / Bing Webmaster ownership tags, set as build-time env vars (see .env.example).
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const ga = settings.gaMeasurementId;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${figtree.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider />
        <AmbientLight />
        {children}
        <Cursor />
        {ga ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
