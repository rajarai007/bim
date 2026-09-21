import type { ReactNode } from "react";

/**
 * Remounts when the top-level segment changes. Route motion itself lives in
 * each page's `<PageTransition>`; `.page-enter` is the CSS fallback for
 * browsers without View Transitions.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
