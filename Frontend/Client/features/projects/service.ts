import { cache } from "react";
import { apiFetch } from "@/lib/api";
import { resolveImage } from "@/lib/media";
import type { Project } from "@/types";

type ApiProject = Omit<Project, "image"> & { image: { src: string; alt: string } | null };

const mapProject = (p: ApiProject): Project => ({ ...p, image: resolveImage(p.image, p.title) });

export const getProjects = cache(async (): Promise<Project[]> => (await apiFetch<ApiProject[]>("/projects")).map(mapProject));

export const getShowcaseProjects = cache(async (): Promise<Project[]> =>
  (await apiFetch<ApiProject[]>("/projects?home=true")).map(mapProject),
);
