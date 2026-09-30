import { Section } from "@/components/layout/section";
import { Cube } from "@/components/motion/drafting-marks";
import { SoftwareChip } from "@/components/ui/chip";
import { softwareList } from "@/data/site";

/** Extra copies of the row so the belt never shows a gap on wide screens. */
const BELT_COPIES = 3;

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
      {/* A slow conveyor of the toolset. Without motion (or JS) only the first
          list shows, wrapped and centred; the copies are decoration. */}
      <div data-reveal="fade" className="marquee [--marquee-gap:12px] md:[--marquee-gap:16px]">
        <ul className="marquee-track">
          {softwareList.map((name) => (
            <li key={name}>
              <SoftwareChip label={name} />
            </li>
          ))}
        </ul>
        {Array.from({ length: BELT_COPIES }, (_, copy) => (
          <ul key={copy} aria-hidden className="marquee-track">
            {softwareList.map((name) => (
              <li key={name}>
                <SoftwareChip label={name} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Section>
  );
}
