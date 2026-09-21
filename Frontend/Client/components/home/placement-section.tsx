import Image from "next/image";
import { Building2 } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { placementPartners, type PlacementPartner } from "@/data/site";
import { routes } from "@/lib/constants";

function PartnerTile({ partner }: { partner: PlacementPartner }) {
  return (
    <li
      data-spotlight
      data-tilt
      className="card-lift btn-shine group flex min-h-[96px] items-center justify-center overflow-hidden rounded-md border border-line bg-surface px-3 py-4 hover:border-primary/40 md:min-h-[104px] md:px-5"
    >
      {partner.logo ? (
        <Image
          src={partner.logo}
          alt={partner.name}
          width={180}
          height={56}
          className="max-h-14 w-auto max-w-full object-contain grayscale transition-[filter,scale] duration-300 ease-brand group-hover:scale-105 group-hover:grayscale-0"
        />
      ) : (
        <span
          className="flex min-w-0 max-w-full flex-col items-center text-center transition-transform duration-300 ease-brand group-hover:scale-105"
          aria-label={partner.name}
        >
          <span className="font-heading text-16 font-black tracking-wide text-heading sm:text-18 md:text-22">
            {partner.wordmark}
          </span>
          {partner.tagline ? (
            <span className="mt-1 font-sans text-10 font-semibold uppercase tracking-[0.08em] text-muted md:tracking-[0.12em]">
              {partner.tagline}
            </span>
          ) : null}
        </span>
      )}
    </li>
  );
}

/** Home "Placement Cell" band: headline + partner logo wall. */
export function PlacementSection() {
  return (
    <Section
      id="placements"
      tone="surface"
      padding="lg"
      containerClassName="flex scroll-mt-20 flex-col gap-10 lg:flex-row lg:items-center lg:gap-16"
    >
      <div
        data-reveal-stagger="up"
        className="flex w-full min-w-0 flex-col items-start gap-5 lg:w-[380px] lg:shrink-0 [--stagger-step:120ms]"
      >
        <Badge tone="primary">Placement Cell</Badge>
        <h2 className="font-heading text-28 font-extrabold leading-native text-heading md:text-32 xl:text-36">
          Biggest Placement Cell For BIM In Asia
        </h2>
        <p className="font-sans text-16 leading-body text-muted">
          with 200+ leading MNCs
        </p>
        <p className="font-sans text-14 leading-body text-muted">
          Our dedicated placement team connects graduates with BIM consultancies, engineering
          firms, and global corporates hiring modelers, coordinators, and BIM managers.
        </p>
        <Button href={routes.contact}>
          <Building2 className="size-4" aria-hidden />
          Talk to Placement Team
        </Button>
      </div>
      <ul
        data-reveal-stagger="scale"
        aria-label="Placement partner companies"
        className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:flex-1 [--stagger-step:80ms]"
      >
        {placementPartners.map((partner) => (
          <PartnerTile key={partner.id} partner={partner} />
        ))}
      </ul>
    </Section>
  );
}
