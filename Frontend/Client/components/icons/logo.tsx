import Link from "next/link";
import { routes } from "@/lib/constants";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Header wordmark: orange "B" mark + two-line "BIM CAREER / ACADEMY". */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={routes.home}
      aria-label={`${siteConfig.name} — home`}
      className={cn("group flex items-center gap-3", className)}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary font-heading text-22 font-black leading-native text-white transition-[scale,rotate,box-shadow] duration-300 ease-brand group-hover:-rotate-6 group-hover:scale-105 group-hover:shadow-[0_8px_20px_-6px_rgb(255_90_31/0.7)]">
        B
      </span>
      <span className="flex flex-col items-start gap-0.5 leading-native whitespace-nowrap">
        <span className="font-heading text-18 font-extrabold text-white">
          {siteConfig.shortName}
        </span>
        <span className="font-sans text-10 font-semibold text-accent">
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}

/** Footer wordmark: smaller mark + single-line name. */
export function FooterLogo() {
  return (
    <Link href={routes.home} className="group flex items-center gap-3" aria-label={`${siteConfig.name} — home`}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-primary font-heading text-18 font-black leading-native text-white transition-transform duration-300 ease-brand group-hover:-rotate-6 group-hover:scale-105">
        B
      </span>
      <span className="font-heading text-20 font-extrabold leading-native text-white whitespace-nowrap">
        {siteConfig.name}
      </span>
    </Link>
  );
}
