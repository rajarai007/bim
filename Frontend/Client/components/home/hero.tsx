import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, Layers } from "lucide-react";
import { CategoryIcon } from "@/components/courses/category-icon";
import { Container } from "@/components/layout/container";
import { HeroScene } from "@/components/motion/hero-scene";
import { SplitWords } from "@/components/motion/split-words";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * Decorative viewer-style readouts that float around the model. Purely
 * presentational (aria-hidden), positioned in the hero's right half on
 * desktop; each one sits on its own depth layer so the pointer parallaxes
 * them against the wireframe.
 */
const hud = [
  {
    key: "Model",
    value: "LOD 400 · Structural",
    tone: "accent",
    depth: 0.55,
    className: "right-[5%] top-[16%]",
    delay: "0s",
  },
  {
    key: "Clash detection",
    value: "0 conflicts",
    tone: "primary",
    depth: 0.35,
    className: "right-[3%] bottom-[20%]",
    delay: "-2.5s",
  },
  {
    key: "Level 06",
    value: "+21.40 m",
    tone: "accent",
    depth: 0.75,
    className: "left-[56%] top-[64%]",
    delay: "-4.5s",
  },
] as const;

// The page's single H1 says what the academy is and where; the label above it and
// the intro below name the disciplines and software. Kept to two display lines.
const headlineLead = "BIM & Revit Training";
const headlineGlow = "Institute in Delhi";
const leadWords = headlineLead.split(" ").length;
const intro =
  "Learn Revit Architecture, Revit Structure, Revit MEP and Navisworks on live projects. Offline classes in New Delhi and live online batches.";

/**
 * Home hero. Layers, far to near: washed photo → gradient mesh → light orbs →
 * perspective floor → live wireframe model → floating readouts → copy.
 * `categories` (from the API) renders the training divisions as quick links.
 */
export function Hero({ categories = [] }: { categories?: Category[] }) {
  return (
    // `overflow-clip` (not hidden): a scroll container would capture the
    // copy's scroll-driven `view()` timeline instead of the viewport.
    <section className="relative flex w-full items-center overflow-clip xl:min-h-[780px]">
      {/* Far layer: the site photo washed into the cream, drifting on scroll. */}
      <div aria-hidden className="photo-fade pointer-events-none absolute inset-0 opacity-50">
        <div data-parallax="0.25" className="absolute inset-x-0 -inset-y-[20%] will-change-transform">
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            sizes="100vw"
            preload
            fetchPriority="high"
            className="kenburns object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-overlay-hero" />
      </div>

      {/* Atmosphere: mesh gradient + light spheres. */}
      <div aria-hidden className="mesh" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          data-depth="0.2"
          className="orb absolute top-[8%] right-[6%] size-[46vmin] max-h-[520px] max-w-[520px] xl:right-[10%] xl:top-[14%]"
          data-tone="primary"
          style={{ "--float-delay": "-3s" } as CSSProperties}
        />
        <span
          data-depth="0.12"
          className="orb absolute -left-[10%] top-[52%] size-[36vmin] max-h-[420px] max-w-[420px]"
          data-tone="violet"
          style={{ "--float-delay": "-8s" } as CSSProperties}
        />
        <span
          data-depth="0.3"
          className="orb absolute right-[28%] bottom-[6%] hidden size-[28vmin] max-h-[320px] max-w-[320px] xl:block"
          data-tone="accent"
        />
      </div>

      {/* Mid layer: the live wireframe model. */}
      <HeroScene />

      {/* Near layer: floating readouts (desktop only). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
        {hud.map((chip) => (
          <div key={chip.key} data-depth={chip.depth} className={cn("absolute", chip.className)}>
            <span
              className="glass glass-edge hud hud-float"
              style={{ "--float-delay": chip.delay } as CSSProperties}
            >
              <span className="hud-dot" data-tone={chip.tone} />
              <span className="hud-key">{chip.key}</span>
              <span className="hud-value">{chip.value}</span>
            </span>
          </div>
        ))}
      </div>

      <Container className="relative flex items-center py-16 md:py-24 xl:py-28">
        <div
          data-scroll="recede"
          className="flex w-full max-w-[760px] flex-col items-start gap-7 md:gap-9"
        >
          <div data-enter="left">
            <span className="glass glass-edge inline-flex items-center gap-2.5 rounded-pill px-4 py-2 font-sans text-12 font-semibold tracking-[0.06em] text-body uppercase">
              <span className="pulse-dot" />
              BIM, Structural &amp; MEP Design
            </span>
          </div>
          <h1
            data-enter="words"
            className="display font-heading text-40 font-medium text-heading md:text-56 xl:text-72 [--enter-delay:80ms]"
          >
            <SplitWords text={headlineLead} />{" "}
            <span className="gradient-text">
              <SplitWords text={headlineGlow} offset={leadWords} />
            </span>
          </h1>
          <p
            data-enter="up"
            className="max-w-[600px] font-sans text-16 leading-body text-body md:text-18 [--enter-delay:250ms]"
          >
            {intro}
          </p>
          <div
            data-enter-stagger="up"
            className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start sm:gap-4 [--stagger-offset:350ms]"
          >
            <Button href={routes.courses} size="lg">
              <Layers className="size-4 transition-transform duration-300 ease-brand group-hover/btn:rotate-12" aria-hidden />
              Explore Courses
            </Button>
            <Button href={routes.contact} variant="outline" size="lg">
              Enquire Now
              <ArrowUpRight className="size-4 transition-transform duration-300 ease-brand group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" aria-hidden />
            </Button>
          </div>

          {/* Training divisions from the catalogue: quick routes into each category. */}
          {categories.length ? (
            <nav aria-label="Training divisions" data-enter="fade" className="mt-2 flex w-full flex-col gap-3 [--enter-delay:550ms]">
              <span className="label">Training divisions</span>
              <ul data-enter-stagger="scale" className="flex flex-wrap gap-2.5 [--stagger-offset:600ms]">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={routes.category(category.slug)}
                      className="glass group/chip inline-flex items-center gap-2 rounded-pill px-3.5 py-2 font-sans text-13 font-semibold leading-native text-body transition-[color,border-color,translate,box-shadow,background-color] duration-300 ease-brand hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary-soft hover:text-heading hover:shadow-[0_12px_28px_-14px_rgb(255_90_31/0.6)]"
                    >
                      <CategoryIcon icon={category.icon} className="size-3.5 text-accent transition-transform duration-300 ease-brand group-hover/chip:scale-110" />
                      {category.badge}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </Container>

      <div aria-hidden className="section-rule absolute inset-x-0 bottom-0" />
    </section>
  );
}
