import Image from "next/image";
import { Mail, Phone, PhoneCall } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Container } from "@/components/layout/container";
import { DraftingMarks } from "@/components/motion/drafting-marks";
import { SplitWords } from "@/components/motion/split-words";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { routes } from "@/lib/constants";

/**
 * Full-bleed closing CTA: a glass panel with an aurora border floating over
 * the mesh and a sunk photo.
 * - `variant="home"`: secondary phone button, circle glyph for WhatsApp
 * - `variant="outline"`: bordered phone button, message glyph (Trainers/Projects/FAQ)
 */
export function FinalCta({
  title,
  description,
  variant = "home",
}: {
  title: string;
  description: string;
  variant?: "home" | "outline";
}) {
  return (
    <section className="relative w-full overflow-clip">
      <div aria-hidden className="mesh" />
      <div aria-hidden className="photo-fade pointer-events-none absolute inset-0 opacity-60">
        <div data-parallax="0.3" className="absolute inset-x-0 -inset-y-[20%] will-change-transform">
          <Image src="/images/cta-bg.png" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-overlay-banner" />
      </div>
      <DraftingMarks variant="band" />
      <Container className="relative py-14 md:py-20 xl:py-24">
        <div className="relative mx-auto flex w-full max-w-[1040px] flex-col items-center gap-6 text-center">
          {/* Light behind the glass so the panel has something to refract. */}
          <div aria-hidden className="panel-glow pointer-events-none absolute -inset-10 -z-10" />
          <div data-reveal="scale" className="glass-strong glass-edge card-aurora flex w-full flex-col items-center gap-7 rounded-xl px-6 py-12 md:px-14 md:py-16">
            <h2
              data-reveal="words"
              className="display max-w-[900px] font-heading text-32 font-medium text-heading md:text-40 xl:text-48"
            >
              <SplitWords text={title} />
            </h2>
            <p
              data-reveal="up"
              data-reveal-delay="3"
              className="max-w-[640px] font-sans text-15 leading-body text-body md:text-16"
            >
              {description}
            </p>
            <div
              data-reveal-stagger="scale"
              className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4 [--stagger-offset:450ms]"
            >
              <Button href={routes.contact}>
                <Mail className="size-4" aria-hidden />
                Enquire Now
              </Button>
              {variant === "home" ? (
                <Button href={siteConfig.contact.phoneHref} variant="secondary">
                  <PhoneCall className="size-4" aria-hidden />
                  {siteConfig.contact.phone}
                </Button>
              ) : (
                <Button href={siteConfig.contact.phoneHref} variant="outline-filled">
                  <Phone className="size-4" aria-hidden />
                  {siteConfig.contact.phone}
                </Button>
              )}
              <Button
                href={siteConfig.contact.whatsappHref}
                variant="whatsapp"
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon
                  variant={variant === "home" ? "circle" : "message"}
                  className="size-4"
                />
                Connect on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
