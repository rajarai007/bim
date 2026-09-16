"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { routes } from "@/lib/constants";

/** Shown when a screen fails to load its data (e.g. the API is unreachable). */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
    <div className="flex min-h-screen min-w-0 flex-1 flex-col p-4 md:p-6 xl:p-8">
      <Card className="flex flex-col items-center gap-4 p-12 text-center">
        <h2 className="font-heading text-24 font-extrabold leading-native text-ink">Unable to load this screen</h2>
        {/* Server errors reach the browser without their message in production (Next.js strips
            them), so the copy is fixed and the digest is shown for support look-ups. */}
        <p className="max-w-[480px] font-sans text-14 leading-native text-body">
          The API is not reachable right now or returned an unexpected error. Make sure the backend is
          running and try again.
        </p>
        {error.digest ? <p className="font-sans text-11 leading-native text-muted">Reference: {error.digest}</p> : null}
        <div className="flex gap-3">
          <Button type="button" onClick={retry}>
            Try again
          </Button>
          <Button href={routes.dashboard} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
