import { cache } from "react";
import { apiFetch } from "@/lib/api";
import type { FaqCategory, FaqItem } from "@/types";

export const getFaqCategories = cache(async (): Promise<FaqCategory[]> => apiFetch<FaqCategory[]>("/faq-categories"));

/** Every published question, the first three expanded (as in the design). */
export const getPageFaqs = cache(async (): Promise<FaqItem[]> => {
  const faqs = await apiFetch<FaqItem[]>("/faqs");
  return faqs.map((f, i) => ({ ...f, defaultOpen: i < 3 }));
});

export const getHomeFaqs = cache(async (): Promise<FaqItem[]> => apiFetch<FaqItem[]>("/faqs?home=true"));
