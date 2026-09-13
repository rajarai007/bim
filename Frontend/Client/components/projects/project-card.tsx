import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/chip";
import { Divider } from "@/components/ui/divider";
import type { Project } from "@/types";

/** Portfolio card on the Projects page. */
export function ProjectCard({ project }: { project: Project }) {
  const { category } = project;
  return (
    <article
      data-spotlight="accent"
      className="card-lift group flex h-full flex-col rounded-md border border-line bg-surface hover:border-accent/50"
    >
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-t-[inherit]">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 1280px) 296px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.06]"
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-3 p-5">
        <div className="flex w-full items-center justify-between">
          <Badge size="sm">{category.badge}</Badge>
        </div>
        <h3 className="w-full font-heading text-18 font-extrabold leading-native text-white">
          {project.title}
        </h3>
        <p className="w-full font-sans text-13 leading-normal text-muted">{project.description}</p>
        <Divider className="mt-auto" />
        <ul className="flex w-full flex-wrap gap-1.5">
          {project.software.map((s) => (
            <li key={s}>
              <Tag tone="body">{s}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/** Compact showcase card on the home page. */
export function ProjectShowcaseCard({ project }: { project: Project }) {
  return (
    <article
      data-spotlight="accent"
      className="card-lift group flex h-full flex-col rounded-md bg-elevated"
    >
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-t-[inherit]">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 1280px) 302px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-elevated/70 to-transparent opacity-80 transition-opacity duration-500 ease-brand group-hover:opacity-0"
        />
      </div>
      <div className="flex w-full items-start gap-3 p-5 leading-native">
        <span className="font-sans text-11 font-bold uppercase text-accent whitespace-nowrap transition-transform duration-300 ease-brand group-hover:-translate-y-0.5">
          {project.category.badge}
        </span>
        <h3 className="min-w-0 flex-1 font-heading text-16 font-bold text-white">
          {project.title}
        </h3>
      </div>
    </article>
  );
}
