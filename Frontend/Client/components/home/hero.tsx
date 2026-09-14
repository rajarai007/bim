import Image from "next/image";
import { Layers } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SplitWords } from "@/components/motion/split-words";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { routes } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative flex w-full items-center overflow-hidden xl:min-h-[680px]">
      <div aria-hidden className="photo-fade pointer-events-none absolute inset-0">
        {/* Oversized so the parallax drift never exposes an edge. */}
        <div data-parallax="0.25" className="absolute inset-x-0 -inset-y-[20%] will-change-transform">
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            sizes="100vw"
            preload
            className="kenburns object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-overlay-hero" />
      </div>
      <Container className="relative flex items-center py-16 md:py-20 xl:py-20">
        <div className="flex w-full max-w-[680px] flex-col items-start gap-6 md:gap-8">
          <div data-reveal="left">
            <Badge>AEC Industry Specialization</Badge>
          </div>
          <h1
            data-reveal="words"
            data-reveal-delay="1"
            className="font-heading text-36 font-black leading-hero text-heading md:text-48 xl:text-56"
          >
            <SplitWords text="Build Your Career in BIM & Design Technology" />
          </h1>
          <p
            data-reveal="up"
            data-reveal-delay="5"
            className="font-sans text-16 leading-body text-body md:text-18"
          >
            {siteConfig.description}
          </p>
          <div
            data-reveal-stagger="up"
            className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start sm:gap-4 [--stagger-offset:650ms]"
          >
            <Button href={routes.courses}>
              <Layers className="size-4 transition-transform duration-300 ease-brand group-hover/btn:rotate-12" aria-hidden />
              Explore Courses
            </Button>
            <Button href={routes.contact} variant="outline">
              Enquire Now
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
