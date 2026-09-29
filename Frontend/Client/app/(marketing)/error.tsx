"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { CloudOff } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";

/** Rendered when a page fails to load its data (e.g. the API is unreachable). */
export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  // The failure happened while rendering on the server, so re-fetch the segment
  // before re-rendering the boundary; `reset()` alone would replay the cached error.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <Section padding="lg" className="overflow-clip" containerClassName="relative flex flex-col items-center py-16 text-center md:py-24">
      <div aria-hidden className="mesh" />
      <div className="glass-strong glass-edge relative flex w-full max-w-[720px] flex-col items-center gap-6 rounded-xl px-6 py-12 md:px-12 md:py-16">
        <span className="well well-round size-16" aria-hidden>
          <CloudOff className="size-7" />
        </span>
        <Badge tone="primary">Something went wrong</Badge>
        <h1 className="display font-heading text-32 font-medium text-heading md:text-40">
          We couldn&apos;t load this page
        </h1>
        <p className="max-w-[560px] font-sans text-16 leading-body text-muted">
          Our content service is temporarily unavailable. Please try again in a moment, or head back to the home page.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button type="button" onClick={retry}>
            Try again
          </Button>
          <Button href={routes.home} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </Section>
  );
}
