"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { routes } from "@/lib/constants";

/** Shown when a screen fails to load its data (e.g. the API is unreachable). */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col p-4 md:p-6 xl:p-8">
      <Card className="flex flex-col items-center gap-4 p-12 text-center">
        <h2 className="font-heading text-24 font-extrabold leading-native text-ink">Unable to load this screen</h2>
        <p className="max-w-[480px] font-sans text-14 leading-native text-body">
          {error.message.includes("Unable to reach the API")
            ? "The API is not reachable right now. Make sure the backend is running and try again."
            : error.message || "Something went wrong while talking to the API."}
        </p>
        <div className="flex gap-3">
          <Button type="button" onClick={reset}>
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
