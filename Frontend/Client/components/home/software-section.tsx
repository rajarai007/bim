import { Section } from "@/components/layout/section";
import { Cube } from "@/components/motion/drafting-marks";
import { SoftwareChip } from "@/components/ui/chip";
import { softwareList } from "@/data/site";

export function SoftwareSection() {
  return (
    <Section tone="surface" className="overflow-clip" containerClassName="relative flex flex-col gap-8 xl:gap-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        <div data-depth="0.35" className="absolute inset-0">
          <Cube className="top-[-10%] left-[4%]" size={88} floatDelay="-1s" />
          <Cube className="bottom-[-14%] right-[5%]" size={120} tone="primary" speed="slow" floatDelay="-6s" />
        </div>
      </div>
      <h2 data-reveal="up" className="w-full text-center font-heading text-22 font-semibold leading-native text-heading md:text-24">
        Software &amp; Technologies We Cover
      </h2>
      <ul data-reveal-stagger="scale" className="flex w-full flex-wrap items-start justify-center gap-3 md:gap-4 [--stagger-step:40ms]">
        {softwareList.map((name) => (
          <li key={name}>
            <SoftwareChip label={name} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
