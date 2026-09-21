import { Container } from "@/components/layout/container";
import { DraftingMarks } from "@/components/motion/drafting-marks";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";

/** Orange-tinted "Not sure which course…" band on category pages. */
export function AdvisorCta() {
  return (
    <section className="relative w-full overflow-clip border-y border-primary bg-primary-soft">
      <DraftingMarks variant="compact" />
      <Container className="relative flex flex-col items-center gap-6 py-12 text-center md:py-16 xl:py-20 [--stagger-step:120ms]" data-reveal-stagger="up">
        <h2 className="font-heading text-24 font-extrabold leading-native text-heading md:text-28 xl:text-32">
          Not sure which course is right for you?
        </h2>
        <p className="font-sans text-15 leading-native text-muted md:text-16">
          Connect with our BIM admissions counseling team to outline your technical roadmap.
        </p>
        <Button href={routes.contact} size="lg">
          Talk to our counselors
        </Button>
      </Container>
    </section>
  );
}
