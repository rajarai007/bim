import Link from "next/link";
import { Mail, MapPin, PhoneCall } from "lucide-react";
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
import type { Category, Course, SiteSettings } from "@/types";

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
  { label: "Trainers", href: routes.trainers },
  { label: "Projects", href: routes.projects },
  { label: "FAQs", href: routes.faq },
  { label: "Contact", href: routes.contact },
  { label: "Privacy Policy", href: routes.privacy },
];

/** Course links shown in the footer; the full catalogue stays one click away on /courses. */
const FOOTER_COURSES = 6;

const linkClass =
  "group/link inline-flex items-center gap-2 font-sans text-14 leading-native text-muted transition-[color,translate] duration-300 ease-brand hover:translate-x-1 hover:text-heading";

const headingClass = "label text-heading";

export function Footer({
  settings,
  categories,
  courses,
}: {
  settings: SiteSettings;
  categories: Category[];
  courses: Course[];
}) {
  const socials = socialIcons.flatMap(({ key, label, Icon }) => {
    const href = settings.social[key];
    return href ? [{ label, Icon, href }] : [];
  });
  const { contact } = settings;
  return (
    <footer className="relative w-full overflow-clip bg-elevated">
      {/* Lit seam between the page and the footer, and a low glow under it. */}
      <div aria-hidden className="section-rule absolute inset-x-0 top-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[radial-gradient(60%_80%_at_50%_100%,rgb(255_90_31/0.08),transparent_70%)]"
      />
      <Container className="relative flex flex-col gap-10 pt-14 pb-8 md:gap-12 md:pt-18 xl:gap-16 xl:pt-24 xl:pb-10">
        <div data-reveal-stagger="up" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12 [--stagger-step:120ms]">
          <div className="flex flex-col items-start gap-6">
            <FooterLogo />
            <p className="max-w-[360px] font-sans text-14 leading-body text-muted">
              India&apos;s premier practical offline &amp; online academy delivering precision education
              in BIM, structural modeling, MEP system planning, and multidisciplinary BIM coordination.
            </p>
            <ul className="flex items-start gap-3">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-full border border-line bg-heading/4 text-body shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-[background-color,color,translate,box-shadow,border-color] duration-300 ease-brand hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_12px_24px_-8px_rgb(255_90_31/0.7)]"
                  >
                    <Icon className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-8">
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
            {/* Every page links straight to the course pages by name. */}
            {courses.length ? (
              <div className="flex flex-col gap-5">
                <h2 className={headingClass}>Courses</h2>
                <ul className="flex flex-col gap-3">
                  {courses.slice(0, FOOTER_COURSES).map((course) => (
                    <li key={course.id}>
                      <Link href={routes.course(course.category.slug, course.slug)} className={linkClass}>
                        {course.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
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
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 font-sans text-14 leading-compact text-muted">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary-bright" aria-hidden />
                {contact.address}
              </li>
              <li>
                <a href={contact.phoneHref} className={linkClass}>
                  <PhoneCall className="size-4 shrink-0 text-accent" aria-hidden />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className={linkClass}>
                  <Mail className="size-4 shrink-0 text-accent" aria-hidden />
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Divider />

        {/* Title block: the strip at the foot of a drawing sheet. */}
        <div data-reveal="fade" className="flex flex-col gap-3 font-sans text-13 leading-native text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved. Designed with
            technical precision.
          </p>
          <p className="hud-key flex items-center gap-2">
            <span className="hud-dot" />
            Offline &amp; Online Technical Training Institute • New Delhi, India
          </p>
        </div>
      </Container>
    </footer>
  );
}
