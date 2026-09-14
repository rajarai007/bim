import Image from "next/image";
import type { CSSProperties } from "react";
import { Star } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Divider } from "@/components/ui/divider";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Testimonial } from "@/types";

function Rating({ value, name }: { value: number; name: string }) {
  return (
    <div className="flex items-start gap-1" role="img" aria-label={`${value} out of 5 stars from ${name}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          style={{ "--star-index": i } as CSSProperties}
          className="star-icon size-3.5 text-accent transition-[fill] duration-300 ease-brand group-hover:fill-accent"
          strokeWidth={2}
          fill="none"
          aria-hidden
        />
      ))}
    </div>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Section
      id="testimonials"
      tone="surface"
      padding="lg"
      containerClassName="flex scroll-mt-20 flex-col gap-10 xl:gap-12"
    >
      <SectionHeading badge="Reviews & Stories" title="What Our Students Say" align="center" />
      <div data-reveal-stagger="up" className="grid grid-cols-1 gap-6 md:grid-cols-3 [--stagger-step:120ms]">
        {testimonials.map((t) => (
          <figure
            key={t.id}
            data-spotlight="accent"
            className="card-lift group flex h-full flex-col items-start gap-6 rounded-md border border-line bg-elevated p-8 hover:border-accent/40"
          >
            <Rating value={t.rating} name={t.name} />
            <blockquote className="font-sans text-14 leading-body text-body">{t.quote}</blockquote>
            <Divider className="mt-auto" />
            <figcaption className="flex w-full items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-transparent transition-[box-shadow,scale] duration-300 ease-brand group-hover:scale-110 group-hover:ring-accent/60">
                <Image src={t.avatar.src} alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-native">
                <span className="font-heading text-15 font-bold text-heading">{t.name}</span>
                <span className="font-sans text-11 text-muted">{t.program}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
