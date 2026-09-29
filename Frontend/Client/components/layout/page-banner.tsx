import Image from "next/image";
import { Breadcrumb, type Crumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { DraftingMarks } from "@/components/motion/drafting-marks";
import { SplitWords } from "@/components/motion/split-words";
import { cn } from "@/lib/utils";

/**
 * Page hero used by every inner page: a photo sunk into the dark, an animated
 * gradient mesh, the drafting layers, a large display H1, optional intro copy
 * and a glass breadcrumb.
 */
export function PageBanner({
  title,
  description,
  crumbs,
  image = "/images/page-banner.png",
  glyph = "lucide",
}: {
  title: string;
  description?: string;
  crumbs: Crumb[];
  image?: string;
  glyph?: "lucide" | "wide";
}) {
  return (
    <section className="relative w-full overflow-clip">
      <div aria-hidden className="mesh" />
      <div aria-hidden className="photo-fade pointer-events-none absolute inset-0 opacity-70">
        <div data-parallax="0.3" className="absolute inset-x-0 -inset-y-[20%] will-change-transform">
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            preload
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-overlay-banner" />
      </div>
      <DraftingMarks variant="banner" />
      <div aria-hidden className="section-rule absolute inset-x-0 bottom-0" />
      <Container className={cn("relative flex flex-col items-start py-14 md:py-20 xl:py-24", description ? "gap-6" : "gap-5")}>
        <div data-enter="up" className="glass glass-edge inline-flex rounded-pill px-4 py-2">
          <Breadcrumb items={crumbs} glyph={glyph} />
        </div>
        <h1
          data-enter="words"
          className="display font-heading text-40 font-medium text-heading md:text-56 xl:text-64 [--enter-delay:80ms]"
        >
          <SplitWords text={title} />
        </h1>
        <div aria-hidden data-enter="fade" className="draw-in w-full max-w-[220px] [--enter-delay:200ms]">
          <div className="dim-line" />
        </div>
        {description ? (
          <p
            data-enter="up"
            className="max-w-[860px] font-sans text-16 leading-body text-body md:text-18 [--enter-delay:260ms]"
          >
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
