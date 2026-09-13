import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { philosophyPoints } from "@/data/site";

export function PhilosophySection() {
  return (
    <Section tone="surface" containerClassName="flex flex-col items-center gap-10 lg:flex-row lg:gap-12">
      <div data-reveal="clip" className="group relative h-[240px] w-full shrink-0 overflow-hidden rounded-md sm:h-[320px] lg:h-[360px] lg:flex-1">
        <Image
          src="/images/about-philosophy.png"
          alt="Isometric MEP coordination model of an office floor"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
        />
      </div>
      <div data-reveal-stagger="up" className="flex w-full min-w-0 flex-col items-start gap-6 lg:flex-1 [--stagger-offset:200ms]">
        <Badge tone="primary">Training Philosophy</Badge>
        <h2 className="font-heading text-28 font-extrabold leading-native text-white xl:text-32">
          Learning Through Real Process Execution
        </h2>
        <p className="font-sans text-15 leading-body text-muted">
          We don&apos;t teach simple tool definitions or commands. Our curriculum centers around
          the BIM Execution Plan (BEP) workflows, LOD schedules (Level of Development),
          coordination standards, and structural load analysis.
        </p>
        <ul data-reveal-stagger="left" className="flex w-full flex-col gap-3 [--stagger-offset:500ms]">
          {philosophyPoints.map((point) => (
            <li key={point} className="group flex w-full items-center gap-2">
              <CircleCheck className="size-4 shrink-0 text-primary transition-transform duration-300 ease-brand group-hover:scale-125" aria-hidden />
              <span className="flex-1 font-sans text-14 font-semibold leading-native text-body">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
