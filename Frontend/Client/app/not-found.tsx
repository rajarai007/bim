import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/site-chrome";
import { NotFoundContent } from "@/components/shared/not-found-content";

export const metadata: Metadata = { title: "Page not found" };

/**
 * Catch-all 404 for URLs that match no route. Lives at the app root because
 * Next.js only uses the root `not-found.tsx` for unmatched paths; it renders the
 * same chrome as the marketing pages instead of the framework's bare default.
 */
export default function RootNotFound() {
  return (
    <SiteChrome>
      <div className="page-enter flex flex-1 flex-col">
        <NotFoundContent />
      </div>
    </SiteChrome>
  );
}
