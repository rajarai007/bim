import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * Route-level view transition: the outgoing page sinks and blurs out, the
 * incoming one rises into focus (`.vt-page` in globals.css). Lives in each
 * `page.tsx` rather than the layout/template because a template only remounts
 * when its own segment changes — `/courses` → `/courses/x` would otherwise
 * swap instantly. Browsers without View Transitions simply swap.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="vt-page" exit="vt-page" default="none">
      <div className="flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
