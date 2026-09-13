"use client";

import { useEffect } from "react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";

/** Rendered when a page fails to load its data (e.g. the API is unreachable). */
export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section padding="lg" containerClassName="flex flex-col items-center gap-6 py-24 text-center">
      <Badge tone="primary">Something went wrong</Badge>
      <h1 className="font-heading text-32 font-black leading-native text-white md:text-40">
        We couldn&apos;t load this page
      </h1>
      <p className="max-w-[560px] font-sans text-16 leading-body text-muted">
        Our content service is temporarily unavailable. Please try again in a moment, or head back to the home page.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button href={routes.home} variant="outline">
          Back to Home
        </Button>
      </div>
    </Section>
  );
}
