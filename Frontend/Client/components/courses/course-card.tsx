import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { BookOpen, Calendar } from "lucide-react";
import { ChevronWide } from "@/components/icons/chevron-wide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { routes } from "@/lib/constants";
import type { ImageAsset } from "@/types";
import { cn } from "@/lib/utils";

// The image wrapper clips itself (rounded-t-[inherit]) so the card can stay
// overflow-visible and its spotlight ring / lift shadow aren't cut off.
const cardBase =
  "card-lift group flex h-full flex-col border border-line bg-surface hover:border-primary/50";

/** Shared-element name: the course page's hero photo carries the same one. */
export const courseMorphName = (slug: string) => `course-${slug}`;

// The photo is a second route to the course (the title link is the accessible
// one), which is what earns it the "View" cursor state. On navigation it
// morphs into the course page's hero image (see `.vt-morph` in globals.css);
// the slug is the last segment of the course URL.
function CardImage({
  href,
  image,
  heightClass,
  sizes,
  morph,
}: {
  href: string;
  image: ImageAsset;
  heightClass: string;
  sizes: string;
  /** A name may only be mounted once per page; pages that list a course twice turn this off on one. */
  morph: boolean;
}) {
  const photo = (
    <div className="absolute inset-0">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.06]"
      />
    </div>
  );
  return (
    <Link
      href={href}
      aria-hidden
      tabIndex={-1}
      data-cursor="view"
      className={cn("relative block w-full shrink-0 overflow-hidden rounded-t-[inherit]", heightClass)}
    >
      {morph ? (
        <ViewTransition name={courseMorphName(href.slice(href.lastIndexOf("/") + 1))} share="vt-morph" default="none">
          {photo}
        </ViewTransition>
      ) : (
        photo
      )}
      {/* Soft top-down tint that lifts on hover so the photo brightens. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent opacity-70 transition-opacity duration-500 ease-brand group-hover:opacity-0"
      />
    </Link>
  );
}

/* ------------------------------------------------------------------------ */
/* Featured card: home grid (md) and category "Featured Programs" row (lg).  */
/* ------------------------------------------------------------------------ */
export function FeaturedCourseCard({
  href,
  title,
  badge,
  description,
  image,
  size = "md",
  meta,
  morph = true,
}: {
  href: string;
  title: string;
  badge: string;
  description: string;
  image: ImageAsset;
  size?: "md" | "lg";
  /** Right-hand meta: "Offline & Online Classes" text (md) or duration w/ icon (lg). */
  meta: { kind: "text"; label: string } | { kind: "duration"; label: string };
  /** Photo morphs into the course page hero on navigation. */
  morph?: boolean;
}) {
  const lg = size === "lg";
  return (
    <article data-spotlight data-tilt className={cn(cardBase, "rounded-lg")}>
      <CardImage
        href={href}
        image={image}
        heightClass={lg ? "h-[220px]" : "h-[180px]"}
        sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
        morph={morph}
      />
      <div className={cn("flex flex-1 flex-col items-start", lg ? "gap-5 p-7" : "gap-4 p-6")}>
        <div className="flex w-full items-center justify-between gap-3">
          <Badge>{badge}</Badge>
          {meta.kind === "duration" ? (
            <span className="flex items-center gap-1.5 font-sans text-13 leading-native text-muted whitespace-nowrap">
              <BookOpen className="size-4" aria-hidden />
              {meta.label}
            </span>
          ) : (
            <span className="font-sans text-12 leading-native text-muted whitespace-nowrap">
              {meta.label}
            </span>
          )}
        </div>
        <h3
          className={cn(
            "w-full font-heading font-extrabold leading-native text-heading",
            lg ? "text-22" : "text-20",
          )}
        >
          <Link href={href} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>
        <p className={cn("w-full font-sans leading-normal text-muted", lg ? "text-14" : "text-13")}>
          {description}
        </p>
        <Divider className="mt-auto" />
        <div className="flex w-full items-start gap-3">
          <Button href={href} variant="secondary" className="flex-1">
            View Details
          </Button>
          <Button href={routes.contact} className={cn(lg && "flex-1")}>
            Enquire
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------------ */
/* Compact card: courses overview rows and "Related Programs".               */
/* ------------------------------------------------------------------------ */
export function CompactCourseCard({
  href,
  title,
  description,
  image,
  morph = true,
}: {
  href: string;
  title: string;
  description: string;
  image: ImageAsset;
  morph?: boolean;
}) {
  return (
    <article data-spotlight data-tilt className={cn(cardBase, "rounded-md")}>
      <CardImage
        href={href}
        image={image}
        heightClass="h-[160px]"
        sizes="(min-width: 1280px) 240px, (min-width: 768px) 33vw, 100vw"
        morph={morph}
      />
      <div className="flex flex-1 flex-col items-start gap-3 p-5">
        <h3 className="w-full truncate font-heading text-16 font-extrabold leading-native text-heading">
          <Link href={href} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>
        <p className="line-clamp-2 w-full font-sans text-13 leading-compact text-muted">
          {description}
        </p>
        <Link
          href={href}
          className="group/link mt-auto flex items-center gap-1 font-sans text-13 font-bold leading-native text-primary transition-colors hover:text-[#ff6b36]"
        >
          View Details
          <ChevronWide
            size={12}
            className="transition-transform duration-300 ease-brand group-hover/link:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------------ */
/* Standard card: "All … Courses" grid on the category page.                */
/* ------------------------------------------------------------------------ */
export function StandardCourseCard({
  href,
  title,
  description,
  duration,
  image,
  morph = true,
}: {
  href: string;
  title: string;
  description: string;
  duration: string;
  image: ImageAsset;
  morph?: boolean;
}) {
  return (
    <article data-spotlight data-tilt className={cn(cardBase, "rounded-md")}>
      <CardImage
        href={href}
        image={image}
        heightClass="h-[140px]"
        sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
        morph={morph}
      />
      <div className="flex flex-1 flex-col items-start gap-4 p-5">
        <h3 className="w-full truncate font-heading text-18 font-extrabold leading-native text-heading">
          <Link href={href} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>
        <p className="line-clamp-2 w-full font-sans text-13 leading-compact text-muted">
          {description}
        </p>
        <span className="flex items-center gap-1.5 font-sans text-12 font-semibold leading-native text-muted">
          <Calendar className="size-4 text-accent" aria-hidden />
          {duration}
        </span>
        <Divider className="mt-auto" />
        <div className="flex w-full items-center justify-between gap-3">
          <Link
            href={href}
            className="group/link flex items-center gap-1 font-sans text-13 font-bold leading-native text-primary transition-colors hover:text-[#ff6b36]"
          >
            View Details
            <ChevronWide
              size={12}
              className="transition-transform duration-300 ease-brand group-hover/link:translate-x-1"
            />
          </Link>
          <Link
            href={routes.contact}
            className="font-sans text-13 font-semibold leading-native text-accent transition-colors hover:text-heading"
          >
            Enquire Now
          </Link>
        </div>
      </div>
    </article>
  );
}
