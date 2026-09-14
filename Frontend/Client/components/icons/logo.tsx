import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/constants";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Brand assets (transparent PNGs cut from the supplied logo). */
export const brand = {
  /** Square "B" emblem — header, favicons, compact placements. */
  mark: "/images/brand/logo-mark.png",
  /** Emblem + "BIM CAREER ACADEMY" wordmark + tagline (1000×845). */
  full: "/images/brand/logo-full.png",
} as const;

/** Header wordmark: "B" emblem + two-line "BIM CAREER / ACADEMY". */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={routes.home}
      aria-label={`${siteConfig.name} — home`}
      className={cn("group flex items-center gap-3", className)}
    >
      <span className="relative size-10 shrink-0 transition-transform duration-300 ease-brand group-hover:-rotate-6 group-hover:scale-105">
        <Image src={brand.mark} alt="" fill sizes="40px" priority className="object-contain" />
      </span>
      <span className="flex flex-col items-start gap-0.5 leading-native whitespace-nowrap">
        <span className="font-heading text-18 font-extrabold text-heading">
          {siteConfig.shortName}
        </span>
        <span className="font-sans text-10 font-semibold text-accent">
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}

/**
 * Footer: the full logo with wordmark and tagline. Its wordmark is white, so it sits
 * on a dark tile that reads the same on light and dark page themes.
 */
export function FooterLogo() {
  return (
    <Link
      href={routes.home}
      aria-label={`${siteConfig.name} — home`}
      className="group inline-flex items-center justify-center rounded-lg border border-white/10 bg-[#0a0d14] px-5 py-4 transition-transform duration-300 ease-brand hover:scale-[1.02]"
    >
      <Image src={brand.full} alt={siteConfig.name} width={1000} height={845} sizes="170px" className="h-auto w-[170px]" />
    </Link>
  );
}
