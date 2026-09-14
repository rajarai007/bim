import Image from "next/image";
import { Clock, Mail, MapPin, PhoneCall } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import type { SiteSettings } from "@/types";

type Row = { label: string; value: string; href?: string; tone: string; icon: React.ReactNode };

function buildRows(contact: SiteSettings["contact"]): Row[] {
  const rows: Row[] = [
    {
      label: "PHYSICAL OFFICE LAB",
      value: contact.address,
      href: undefined,
      tone: "bg-primary-soft text-primary",
      icon: <MapPin className="size-4" aria-hidden />,
    },
    {
      label: "OFFLINE ADMISSIONS HELPLINE",
      value: contact.phone,
      href: contact.phoneHref,
      tone: "bg-accent-soft text-accent",
      icon: <PhoneCall className="size-4" aria-hidden />,
    },
  ];
  if (contact.whatsapp && contact.whatsappHref) {
    rows.push({
      label: "WHATSAPP CHAT",
      value: `${contact.whatsapp} (Direct Support)`,
      href: contact.whatsappHref,
      tone: "bg-whatsapp/10 text-whatsapp",
      icon: <WhatsAppIcon className="size-[18px]" />,
    });
  }
  rows.push({
    label: "OFFICIAL INQUIRIES",
    value: contact.email,
    href: `mailto:${contact.email}`,
    tone: "bg-muted-soft text-muted",
    icon: <Mail className="size-4" aria-hidden />,
  });
  // Managed in the admin console (Settings → Working Hours); omitted when not set.
  if (contact.hours) {
    rows.push({
      label: "WORKING HOURS",
      value: contact.hours,
      href: undefined,
      tone: "bg-primary-soft text-primary",
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
        className="flex w-full flex-col items-start gap-7 rounded-md bg-surface p-6 md:p-8"
      >
        <h2 className="font-heading text-24 font-extrabold leading-native text-heading">
          Academy Details
        </h2>
        <ul data-reveal-stagger="left" className="flex w-full flex-col gap-7 [--stagger-offset:300ms]">
          {rows.map((row) => (
            <li key={row.label} className="group flex w-full items-start gap-4">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-[scale,rotate] duration-400 ease-brand group-hover:-rotate-6 group-hover:scale-110 ${row.tone}`}
              >
                {row.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1 leading-native">
                <span className="font-sans text-12 text-muted">{row.label}</span>
                {row.href ? (
                  <a
                    href={row.href}
                    className="font-sans text-14 font-semibold text-body transition-colors hover:text-heading"
                    target={row.href.startsWith("http") ? "_blank" : undefined}
                    rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {row.value}
                  </a>
                ) : (
                  <span className="font-sans text-14 font-semibold text-body">{row.value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div data-reveal="up" className="flex w-full flex-col items-start gap-4">
        <h2 className="font-heading text-18 font-extrabold leading-native text-heading">
          Location Map
        </h2>
        <div className="group relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-md">
          <Image
            src="/images/contact-map.png"
            alt="Map centred on the academy at Okhla Head, Jamia Nagar, New Delhi"
            fill
            sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, 100vw"
            className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.06]"
          />
          <span className="relative rounded-xs bg-canvas px-4 py-2 font-sans text-11 font-bold leading-native text-primary whitespace-nowrap shadow-[0_0_0_0_rgb(255_90_31/0.4)] transition-[box-shadow,scale] duration-500 ease-brand group-hover:scale-105 group-hover:shadow-[0_0_0_8px_rgb(255_90_31/0)]">
            CENTERED AT OKHLA HEAD
          </span>
        </div>
      </div>
    </aside>
  );
}
