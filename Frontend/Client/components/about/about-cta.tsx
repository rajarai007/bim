import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";

export function AboutCta() {
  return (
    <Section
      tone="surface"
      stagger="up"
      containerClassName="flex flex-col items-center gap-6 text-center [--stagger-step:120ms]"
    >
      <h2 className="font-heading text-28 font-extrabold leading-native text-heading xl:text-32">
        Start Your Professional Journey Today
      </h2>
      <p className="max-w-[600px] font-sans text-15 leading-native text-muted">
        Unlock high-value positions in architectural structures, digital design rendering, and
        coordinated MEP systems modeling.
      </p>
      <Button href={routes.contact}>Enquire Now</Button>
    </Section>
  );
}
