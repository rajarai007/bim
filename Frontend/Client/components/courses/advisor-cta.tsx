import { Container } from "@/components/layout/container";
import { DraftingMarks } from "@/components/motion/drafting-marks";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";

/** Orange-lit "Not sure which course…" band on category pages. */
export function AdvisorCta() {
  return (
    <section className="relative w-full overflow-clip border-y border-primary/30 bg-[radial-gradient(80%_120%_at_50%_120%,rgb(255_90_31/0.18),transparent_70%)]">
      <div aria-hidden className="mesh opacity-60" />
      <DraftingMarks variant="compact" />
      <Container className="relative flex flex-col items-center gap-6 py-14 text-center md:py-18 xl:py-22 [--stagger-step:120ms]" data-reveal-stagger="up">
        <h2 className="display font-heading text-28 font-semibold text-heading md:text-32 xl:text-40">
          Not sure which course is right for you?
        </h2>
        <p className="max-w-[560px] font-sans text-15 leading-body text-body md:text-16">
          Connect with our BIM admissions counseling team to outline your technical roadmap.
        </p>
        <Button href={routes.contact} size="lg">
          Talk to our counselors
        </Button>
      </Container>
    </section>
  );
}
