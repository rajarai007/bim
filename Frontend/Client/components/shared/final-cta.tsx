import Image from "next/image";
import { Mail, Phone, PhoneCall } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Container } from "@/components/layout/container";
import { SplitWords } from "@/components/motion/split-words";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { routes } from "@/lib/constants";

/**
 * Full-bleed closing CTA with a photo background.
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
    <section className="relative w-full overflow-hidden">
      <div aria-hidden className="photo-fade pointer-events-none absolute inset-0">
        <div data-parallax="0.3" className="absolute inset-x-0 -inset-y-[20%] will-change-transform">
          <Image src="/images/cta-bg.png" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-overlay-banner" />
        <span className="orb absolute top-1/2 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-10 blur-[120px]" />
      </div>
      <Container className="relative flex flex-col items-center gap-6 py-12 text-center md:py-16 xl:py-20">
        <h2
          data-reveal="words"
          className="max-w-[960px] font-heading text-28 font-black leading-native text-heading md:text-32 xl:text-40"
        >
          <SplitWords text={title} />
        </h2>
        <p
          data-reveal="up"
          data-reveal-delay="3"
          className="max-w-[640px] font-sans text-15 leading-native text-body md:text-16"
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
      </Container>
    </section>
  );
}
