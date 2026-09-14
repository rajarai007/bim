import Image from "next/image";
import { Check } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aboutBullets } from "@/data/site";
import { routes } from "@/lib/constants";

export function AboutPreview() {
  return (
    <Section padding="lg" containerClassName="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
      <div data-reveal="clip" className="group relative h-[240px] w-full shrink-0 overflow-hidden rounded-lg sm:h-[320px] lg:h-[380px] lg:flex-1">
        <Image
          src="/images/about-preview.png"
          alt="Students collaborating on BIM models in the academy classroom"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
        />
      </div>
      <div data-reveal-stagger="up" className="flex w-full min-w-0 flex-col items-start gap-6 lg:flex-1 [--stagger-offset:200ms]">
        <Badge tone="primary">About Us</Badge>
        <h2 className="font-heading text-28 font-extrabold leading-native text-heading md:text-32 xl:text-36">
          Engineering the Future of Construction Professionals
        </h2>
        <p className="font-sans text-16 leading-body text-muted">
          BIM Career Academy is committed to delivering practical, industry-aligned training in
          architectural technology. We focus on bridging the gap between academic theory and
          real-world execution.
        </p>
        <ul data-reveal-stagger="left" className="flex w-full flex-col gap-3 [--stagger-offset:500ms]">
          {aboutBullets.map((bullet) => (
            <li key={bullet} className="group flex w-full items-center gap-2">
              <Check className="size-4 shrink-0 text-accent transition-transform duration-300 ease-brand group-hover:scale-125" aria-hidden />
              <span className="flex-1 font-sans text-14 font-semibold leading-native text-body">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
        <Button href={routes.about} variant="secondary">
          Know More About Us
        </Button>
      </div>
    </Section>
  );
}
