import type { CSSProperties } from "react";
import { InstagramMark, LinkedinMark, WhatsappMark } from "@/components/icons/brand-marks";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types";

/**
 * Floating social rail: a column of brand buttons pinned to the right edge on
 * desktop and to the bottom-right corner on phones, where a centred rail would
 * sit over the content. Links come from the admin console, so a channel that
 * has no URL configured simply drops out.
 */
export function SocialRail({ settings }: { settings: SiteSettings }) {
  const links = [
    { label: "LinkedIn", href: settings.social.linkedin, brand: "#0a66c2", Mark: LinkedinMark },
    { label: "WhatsApp", href: settings.contact.whatsappHref, brand: "#22a75a", Mark: WhatsappMark },
    { label: "Instagram", href: settings.social.instagram, brand: "#d62976", Mark: InstagramMark },
  ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

  if (!links.length) return null;

  return (
    <aside
      aria-label="Follow us"
      className="fixed right-3 bottom-5 z-30 flex flex-col items-center gap-2.5 print:hidden md:top-1/2 md:right-4 md:bottom-auto md:-translate-y-1/2 md:gap-3"
    >
      {links.map(({ label, href, brand, Mark }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          data-magnetic
          style={{ "--brand": brand } as CSSProperties}
          className={cn(
            "glass flex size-10 items-center justify-center rounded-full text-[var(--brand)] md:size-11",
            "transition-[background-color,color,border-color,box-shadow,translate] duration-300 ease-brand",
            "hover:-translate-x-1 hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white",
            "hover:shadow-[0_12px_24px_-10px_var(--brand)] focus-visible:border-[var(--brand)]",
          )}
        >
          <Mark className="size-[18px] md:size-5" />
        </a>
      ))}
    </aside>
  );
}
