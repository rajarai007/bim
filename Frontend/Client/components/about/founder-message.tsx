import Image from "next/image";
import { Quote } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { founderMessage } from "@/data/site";
import { siteConfig } from "@/lib/config";

/**
 * The founder's note. It sits between the plain-canvas intro and the full-bleed
 * philosophy sheet, so it carries its own raised card to stay a distinct beat.
 */
export function FounderMessage() {
  return (
    <Section>
      <div
        data-spotlight="accent"
        className="card-lift overflow-hidden rounded-lg border border-line bg-surface"
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div
            data-reveal="clip"
            className="group relative h-[460px] w-full shrink-0 overflow-hidden sm:h-[520px] lg:h-[560px] lg:w-[420px] xl:w-[460px]"
          >
            <Image
              src="/images/about-founder.jpg"
              alt={`${founderMessage.name}, ${founderMessage.role} of ${siteConfig.name}, at the academy office`}
              fill
              sizes="(min-width: 1280px) 460px, (min-width: 1024px) 420px, 100vw"
              className="object-cover object-top transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
            />
            <div aria-hidden className="viewer-frame pointer-events-none absolute inset-0" />
            {/* Viewer readout: parallax against the portrait (desktop only). */}
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
              <div data-depth="0.6" className="absolute right-5 bottom-5">
                <span className="glass glass-edge hud hud-float">
                  <span className="hud-dot" />
                  <span className="hud-key">Based in</span>
                  <span className="hud-value">New Delhi</span>
                </span>
              </div>
            </div>
          </div>

          <div
            data-reveal-stagger="up"
            className="flex min-w-0 flex-1 flex-col items-start gap-6 p-8 md:p-10 lg:justify-center lg:p-12 xl:p-14 [--stagger-offset:200ms]"
          >
            <Badge>Leadership</Badge>
            <h2 className="font-heading text-28 font-extrabold leading-native text-heading md:text-32 xl:text-36">
              A Message From Our Founder
            </h2>
            <blockquote className="relative w-full pl-8 font-heading text-18 font-bold leading-body text-heading md:text-20">
              <Quote
                className="absolute top-0.5 left-0 size-5 shrink-0 text-accent"
                aria-hidden
              />
              {founderMessage.quote}
            </blockquote>
            {founderMessage.paragraphs.map((paragraph) => (
              <p key={paragraph} className="font-sans text-15 leading-body text-muted md:text-16">
                {paragraph}
              </p>
            ))}
            <Divider />
            <div className="flex w-full flex-col gap-1">
              <p className="font-heading text-18 font-extrabold leading-native text-heading">
                {founderMessage.name}
              </p>
              <p className="font-sans text-13 font-bold leading-native text-primary">
                {founderMessage.role}, {siteConfig.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
