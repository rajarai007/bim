import type { Metadata } from "next";
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

/** Content is managed in the admin console, so every page renders fresh data on request. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
