import { cache } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { siteConfig } from "@/lib/config";
import type { SiteSettings } from "@/types";

type ApiSettings = {
  name: string;
  contact: { phone: string; whatsapp: string | null; email: string; address: string; hours: string | null };
  social: { instagram: string | null; facebook: string | null; linkedin: string | null; youtube: string | null };
  gaMeasurementId: string | null;
};

const digits = (value: string) => value.replace(/[^0-9+]/g, "");

function mapSettings(s: ApiSettings): SiteSettings {
  return {
    name: s.name,
    contact: {
      phone: s.contact.phone,
      phoneHref: `tel:${digits(s.contact.phone)}`,
      whatsapp: s.contact.whatsapp,
      whatsappHref: s.contact.whatsapp ? `https://wa.me/${digits(s.contact.whatsapp).replace(/^\+/, "")}` : null,
      email: s.contact.email,
      address: s.contact.address,
      hours: s.contact.hours,
    },
    social: s.social,
    gaMeasurementId: s.gaMeasurementId,
  };
}

/** Static fallback so the chrome (header/footer) still renders if the API is unreachable. */
const fallback: SiteSettings = {
  name: siteConfig.name,
  contact: { ...siteConfig.contact, hours: null },
  social: siteConfig.social,
  gaMeasurementId: null,
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return mapSettings(await apiFetch<ApiSettings>("/settings"));
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    console.error("[settings] falling back to static site config:", err.message);
    return fallback;
  }
});
