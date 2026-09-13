import type { ReactNode } from "react";

/** Remounts on every navigation so each page fades and rises into view. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
