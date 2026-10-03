import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SocialRail } from "@/components/layout/social-rail";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategories, getCourses } from "@/features/courses/service";
import { getSiteSettings } from "@/features/settings/service";
import { organizationSchema } from "@/lib/schema";

/**
 * Header + footer around the page content. Used by the marketing layout and by
 * the root not-found page (which renders outside the `(marketing)` group, so it
 * would otherwise appear without the site chrome).
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, categories, courses] = await Promise.all([
    getSiteSettings(),
    getCategories().catch(() => []),
    getCourses().catch(() => []),
  ]);

  return (
    <>
      {/* The academy's name, address and phone as structured data, from the same settings the footer shows. */}
      <JsonLd data={organizationSchema(settings)} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header contact={settings.contact} />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer settings={settings} categories={categories} courses={courses} />
      <SocialRail settings={settings} />
    </>
  );
}
