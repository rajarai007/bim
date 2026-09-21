import Link from "next/link";
import { FooterLogo } from "@/components/icons/logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/icons/social-icons";
import { Container } from "@/components/layout/container";
import { Divider } from "@/components/ui/divider";
import { routes } from "@/lib/constants";
import type { Category, SiteSettings } from "@/types";

const socialIcons = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
] as const;

const quickLinks = [
  { label: "Home", href: routes.home },
  { label: "About Us", href: routes.about },
  { label: "Courses", href: routes.courses },
  { label: "Why Choose Us", href: routes.whyChooseUs },
  { label: "Projects", href: routes.projects },
  { label: "Privacy Policy", href: routes.privacy },
];

const linkClass =
  "inline-block font-sans text-14 leading-native text-muted transition-[color,translate] duration-300 ease-brand hover:translate-x-1 hover:text-body";

const headingClass = "font-heading text-16 font-bold uppercase leading-native text-heading";

export function Footer({ settings, categories }: { settings: SiteSettings; categories: Category[] }) {
  const socials = socialIcons.flatMap(({ key, label, Icon }) => {
    const href = settings.social[key];
    return href ? [{ label, Icon, href }] : [];
  });
  const { contact } = settings;
  return (
    <footer className="sheet relative w-full">
      <Container className="flex flex-col gap-10 pt-12 pb-8 md:gap-12 md:pt-16 xl:gap-16 xl:pt-20 xl:pb-10">
        <div data-reveal-stagger="up" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 [--stagger-step:120ms]">
          <div className="flex flex-col items-start gap-6">
            <FooterLogo />
            <p className="font-sans text-14 leading-body text-muted">
              India&apos;s premier practical offline academy delivering precision education
              in BIM, structural modeling, MEP system planning, and realistic visual design.
            </p>
            <ul className="flex items-start gap-3">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="glass flex size-9 items-center justify-center rounded-full text-body transition-[background-color,color,translate,box-shadow,border-color] duration-300 ease-brand hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_10px_20px_-8px_rgb(255_90_31/0.6)]"
                  >
                    <Icon className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className={headingClass}>Categories</h2>
            <ul className="flex flex-col gap-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={routes.category(c.slug)} className={linkClass}>
                    {c.footerLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className={headingClass}>Quick Links</h2>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className={headingClass}>Contact</h2>
            <ul className="flex flex-col gap-3">
              <li className="font-sans text-14 leading-native text-muted">
                📍 {contact.address}
              </li>
              <li>
                <a href={contact.phoneHref} className={linkClass}>
                  📞 {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className={linkClass}>
                  ✉️ {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Divider />

        {/* Title block: the strip at the foot of a drawing sheet. */}
        <div data-reveal="fade" className="flex flex-col gap-2 font-sans text-13 leading-native text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved. Designed with
            technical precision.
          </p>
          <p className="hud-key flex items-center gap-2">
            <span className="hud-dot" />
            Offline Technical Training Institute • New Delhi, India
          </p>
        </div>
      </Container>
    </footer>
  );
}
