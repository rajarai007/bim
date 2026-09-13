import { cache } from "react";
import { apiFetch } from "@/lib/api";
import { resolveImage } from "@/lib/media";
import type { Testimonial } from "@/types";

type ApiTestimonial = Omit<Testimonial, "avatar"> & { avatar: { src: string; alt: string } | null };

export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  (await apiFetch<ApiTestimonial[]>("/testimonials")).map((t) => ({ ...t, avatar: resolveImage(t.avatar, t.name) })),
);
