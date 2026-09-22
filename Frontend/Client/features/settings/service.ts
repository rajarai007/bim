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

/**
 * A social URL with no path (e.g. "https://instagram.com") is the seeded
 * placeholder rather than a profile, so the known account in `siteConfig`
 * is used instead. Any real profile URL set in the admin console wins.
 */
function profileUrl(value: string | null, fallbackUrl: string): string | null {
  if (!value) return fallbackUrl || null;
  try {
    const url = new URL(value);
    if (url.pathname.replace(/\/+$/, "") === "" && !url.search) return fallbackUrl || null;
  } catch {
    return fallbackUrl || null;
  }
  return value;
}

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
    social: {
      instagram: profileUrl(s.social.instagram, siteConfig.social.instagram),
      facebook: profileUrl(s.social.facebook, siteConfig.social.facebook),
      linkedin: profileUrl(s.social.linkedin, siteConfig.social.linkedin),
      youtube: profileUrl(s.social.youtube, siteConfig.social.youtube),
    },
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
