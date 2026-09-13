import Image from "next/image";
import { LinkedinIcon } from "@/components/icons/social-icons";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/chip";
import { Divider } from "@/components/ui/divider";
import type { Trainer } from "@/types";

/** Full trainer card used on the Trainers page. */
export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <article
      data-spotlight
      className="card-lift group flex h-full flex-col rounded-md border border-line bg-surface hover:border-primary/50"
    >
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden rounded-t-[inherit]">
        <Image
          src={trainer.image.src}
          alt={trainer.image.alt}
          fill
          sizes="(min-width: 1280px) 296px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-surface/70 to-transparent opacity-80 transition-opacity duration-500 ease-brand group-hover:opacity-0"
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-3 p-5">
        <h3 className="w-full font-heading text-20 font-extrabold leading-native text-white">
          {trainer.name}
        </h3>
        <p className="w-full font-sans text-14 font-bold leading-native text-primary">
          {trainer.role}
        </p>
        <p className="w-full font-sans text-12 leading-native text-muted">{trainer.bio}</p>
        <Badge>{trainer.experience}</Badge>
        <Divider className="mt-auto" />
        <div className="flex w-full items-center justify-between gap-3">
          <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {trainer.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
          {trainer.linkedin ? (
            <a
              href={trainer.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${trainer.name} on LinkedIn`}
              className="flex size-4 shrink-0 items-center justify-center text-muted transition-[color,scale] duration-300 ease-brand hover:scale-125 hover:text-[#0a66c2]"
            >
              <LinkedinIcon className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Condensed card used in the home "Meet Our Expert Trainers" row. */
export function TrainerCardCompact({ trainer }: { trainer: Trainer }) {
  return (
    <article
      data-spotlight
      className="card-lift group flex h-full flex-col rounded-md border border-line bg-surface hover:border-primary/50"
    >
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden rounded-t-[inherit]">
        <Image
          src={trainer.image.src}
          alt={trainer.image.alt}
          fill
          sizes="(min-width: 1280px) 296px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-surface/70 to-transparent opacity-80 transition-opacity duration-500 ease-brand group-hover:opacity-0"
        />
      </div>
      <div className="flex flex-col items-start gap-3 p-5">
        <h3 className="font-heading text-18 font-bold leading-native text-white">{trainer.name}</h3>
        <p className="font-sans text-13 font-semibold leading-native text-primary">
          {trainer.homeRole ?? trainer.role}
        </p>
        {trainer.specialization ? (
          <p className="font-sans text-12 leading-native text-muted">
            Specialization: {trainer.specialization}
          </p>
        ) : null}
      </div>
    </article>
  );
}
