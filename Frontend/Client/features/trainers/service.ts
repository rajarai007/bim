import { cache } from "react";
import { apiFetch } from "@/lib/api";
import { resolveImage } from "@/lib/media";
import type { Trainer } from "@/types";

type ApiTrainer = Omit<Trainer, "image"> & { image: { src: string; alt: string } | null };

const mapTrainer = (t: ApiTrainer): Trainer => ({ ...t, image: resolveImage(t.image, t.name) });

export const getTrainers = cache(async (): Promise<Trainer[]> => (await apiFetch<ApiTrainer[]>("/trainers")).map(mapTrainer));

export const getHomeTrainers = cache(async (): Promise<Trainer[]> =>
  (await apiFetch<ApiTrainer[]>("/trainers?home=true")).map(mapTrainer),
);
