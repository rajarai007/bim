import Image from "next/image";
import { Breadcrumb, type Crumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { DraftingMarks } from "@/components/motion/drafting-marks";
import { SplitWords } from "@/components/motion/split-words";
import { cn } from "@/lib/utils";

/**
 * Page hero used by every inner page: background photo with a 90% paper
 * overlay, H1, optional intro copy and a breadcrumb.
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
      <div aria-hidden className="photo-fade pointer-events-none absolute inset-0">
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
      <Container className={cn("relative flex flex-col items-start py-12 md:py-16 xl:py-20", description ? "gap-5" : "gap-4")}>
        <h1
          data-reveal="words"
          className="font-heading text-32 font-black leading-native text-heading md:text-40 xl:text-48"
        >
          <SplitWords text={title} />
        </h1>
        <div aria-hidden data-reveal="fade" data-reveal-delay="2" className="draw-in w-full max-w-[220px]">
          <div className="dim-line" />
        </div>
        {description ? (
          <p
            data-reveal="up"
            data-reveal-delay="3"
            className="max-w-[1120px] font-sans text-16 leading-normal text-body md:text-18"
          >
            {description}
          </p>
        ) : null}
        <div data-reveal="up" data-reveal-delay="4" className="glass glass-edge inline-flex rounded-md px-3.5 py-2">
          <Breadcrumb items={crumbs} glyph={glyph} />
        </div>
      </Container>
    </section>
  );
}
