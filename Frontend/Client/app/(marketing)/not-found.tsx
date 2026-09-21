import { PageTransition } from "@/components/motion/page-transition";
import { NotFoundContent } from "@/components/shared/not-found-content";

/** Rendered by `notFound()` inside the marketing routes (unknown category / course). */
export default function NotFound() {
  return (
    <PageTransition>
      <NotFoundContent />
    </PageTransition>
  );
}
