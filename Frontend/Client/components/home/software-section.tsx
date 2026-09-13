import { Section } from "@/components/layout/section";
import { SoftwareChip } from "@/components/ui/chip";
import { softwareList } from "@/data/site";

export function SoftwareSection() {
  return (
    <Section tone="surface" containerClassName="flex flex-col gap-8 xl:gap-10">
      <h2 data-reveal="up" className="w-full text-center font-heading text-22 font-extrabold leading-native text-white md:text-24">
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
