import Image from "next/image";
import { Clock, Mail, MapPin, PhoneCall } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import type { SiteSettings } from "@/types";

type Tone = "primary" | "accent" | "whatsapp" | "muted";
type Row = { label: string; value: string; href?: string; tone: Tone; icon: React.ReactNode };

function buildRows(contact: SiteSettings["contact"]): Row[] {
  const rows: Row[] = [
    {
      label: "PHYSICAL OFFICE LAB",
      value: contact.address,
      href: undefined,
      tone: "primary",
      icon: <MapPin className="size-4" aria-hidden />,
    },
    {
      label: "OFFLINE & ONLINE ADMISSIONS HELPLINE",
      value: contact.phone,
      href: contact.phoneHref,
      tone: "accent",
      icon: <PhoneCall className="size-4" aria-hidden />,
    },
  ];
  if (contact.whatsapp && contact.whatsappHref) {
    rows.push({
      label: "WHATSAPP CHAT",
      value: `${contact.whatsapp} (Direct Support)`,
      href: contact.whatsappHref,
      tone: "whatsapp",
      icon: <WhatsAppIcon className="size-[18px]" />,
    });
  }
  rows.push({
    label: "OFFICIAL INQUIRIES",
    value: contact.email,
    href: `mailto:${contact.email}`,
    tone: "muted",
    icon: <Mail className="size-4" aria-hidden />,
  });
  // Managed in the admin console (Settings → Working Hours); omitted when not set.
  if (contact.hours) {
    rows.push({
      label: "WORKING HOURS",
      value: contact.hours,
      href: undefined,
      tone: "primary",
      icon: <Clock className="size-4" aria-hidden />,
    });
  }
  return rows;
}

export function ContactInfo({ contact }: { contact: SiteSettings["contact"] }) {
  const rows = buildRows(contact);
  return (
    <aside className="flex w-full flex-col items-start gap-10 lg:w-[420px] xl:w-[480px]">
      <div
        data-reveal="right"
        data-reveal-delay="2"
        className="glass glass-edge flex w-full flex-col items-start gap-7 rounded-lg p-6 md:p-8"
      >
        <h2 className="font-heading text-24 font-semibold leading-native text-heading">
          Academy Details
        </h2>
        <ul data-reveal-stagger="left" className="flex w-full flex-col gap-7 [--stagger-offset:300ms]">
          {rows.map((row) => (
            <li key={row.label} className="group flex w-full items-start gap-4">
              <span className="well well-round size-10 shrink-0" data-tone={row.tone === "primary" ? undefined : row.tone}>
                {row.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5 leading-native">
                <span className="label">{row.label}</span>
                {row.href ? (
                  <a
                    href={row.href}
                    className="font-sans text-15 font-semibold text-heading transition-colors hover:text-primary-bright"
                    target={row.href.startsWith("http") ? "_blank" : undefined}
                    rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="font-sans text-15 font-semibold leading-compact text-heading">{row.value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div data-reveal="up" className="flex w-full flex-col items-start gap-4">
        <h2 className="font-heading text-18 font-semibold leading-native text-heading">
          Location Map
        </h2>
        <div data-tilt className="group relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-lg border border-line shadow-[var(--shadow-sheet)]">
          <Image
            src="/images/contact-map.png"
            alt="Map centred on the academy at Okhla Head, Jamia Nagar, New Delhi"
            fill
            sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, 100vw"
            className="object-cover opacity-80 saturate-[0.7] transition-[transform,opacity,filter] duration-700 ease-brand group-hover:scale-[1.06] group-hover:opacity-100 group-hover:saturate-100"
          />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent,rgb(7_9_15/0.6))]" />
          <div aria-hidden className="viewer-frame pointer-events-none absolute inset-0 rounded-[inherit]" />
          <span className="glass glass-edge relative rounded-pill px-4 py-2 font-sans text-11 font-semibold leading-native tracking-[0.08em] text-primary-bright whitespace-nowrap transition-[scale] duration-500 ease-brand group-hover:scale-105">
            CENTERED AT OKHLA HEAD
          </span>
        </div>
      </div>
    </aside>
  );
}
