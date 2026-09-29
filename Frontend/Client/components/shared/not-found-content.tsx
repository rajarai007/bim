import { Section } from "@/components/layout/section";
import { DraftingMarks } from "@/components/motion/drafting-marks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";

/** Body of the 404 screen, shared by the root and marketing not-found pages. */
export function NotFoundContent() {
  return (
    <Section
      padding="lg"
      className="overflow-clip"
      containerClassName="relative flex flex-col items-center py-16 text-center md:py-24"
    >
      <div aria-hidden className="mesh" />
      <DraftingMarks variant="band" />
      <div data-reveal-stagger="up" className="glass-strong glass-edge relative flex w-full max-w-[720px] flex-col items-center gap-6 rounded-xl px-6 py-12 md:px-12 md:py-16 [--stagger-step:120ms]">
        <span aria-hidden className="gradient-text-cool display font-heading text-72 font-semibold leading-none md:text-[120px]">
          404
        </span>
        <Badge tone="primary">Error 404</Badge>
        <h1 className="display font-heading text-32 font-medium text-heading md:text-40 xl:text-48">
          Page not found
        </h1>
        <p className="max-w-[560px] font-sans text-16 leading-body text-muted">
          The page you are looking for doesn&apos;t exist or has been moved. Explore our training
          programs or head back to the home page.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button href={routes.courses}>Explore Courses</Button>
          <Button href={routes.home} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </Section>
  );
}
