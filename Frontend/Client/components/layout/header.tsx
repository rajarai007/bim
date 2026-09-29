"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, PhoneCall, X } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { navItems, routes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types";

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Floating glass navigation. The sticky <header> itself stays free of
 * transforms and filters (it hosts the fixed mobile drawer); the frosted
 * shell inside it tightens and lights up once the page scrolls.
 */
export function Header({ contact }: { contact: SiteSettings["contact"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes (state derived during render,
  // per React's "adjusting state when a prop changes" guidance).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // One soft pill slides between nav links: it follows the hovered link and
  // settles back on the active route. Measured from the DOM so it never
  // depends on link widths; written directly so hovering never re-renders.
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const moveIndicator = useCallback((target: HTMLElement | null) => {
    const bar = indicatorRef.current;
    if (!bar) return;
    if (!target) {
      bar.style.opacity = "0";
      return;
    }
    bar.style.opacity = "1";
    bar.style.width = `${target.offsetWidth}px`;
    bar.style.transform = `translateX(${target.offsetLeft}px)`;
  }, []);
  const settleIndicator = useCallback(() => {
    moveIndicator(navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]') ?? null);
  }, [moveIndicator]);
  useEffect(() => {
    // Re-measure whenever the active route changes (fonts may also settle late).
    settleIndicator();
    window.addEventListener("resize", settleIndicator);
    document.fonts?.ready.then(settleIndicator);
    return () => window.removeEventListener("resize", settleIndicator);
  }, [pathname, settleIndicator]);

  // Frost the shell once the page scrolls and drive the reading-progress bar.
  // The bar is written straight to the DOM so scrolling never re-renders.
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, y / max) : 0;
      progressRef.current?.style.setProperty("transform", `scaleX(${progress})`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const iconButton =
    "flex size-10 items-center justify-center rounded-full border border-line bg-white/4 text-body shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-[background-color,color,border-color,translate,scale,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:border-line-strong hover:bg-white/8 hover:text-heading active:translate-y-0 active:scale-95";

  return (
    <header className="header-in sticky top-0 z-50 w-full">
      <Container className="pt-3 md:pt-4">
        <div
          data-scrolled={scrolled || undefined}
          className="nav-shell flex h-14 items-center justify-between gap-4 px-3 md:h-16 md:px-4 xl:px-5"
        >
          <Logo />

          <nav
            ref={navRef}
            aria-label="Primary"
            className="relative hidden items-center gap-1 xl:flex"
            onPointerLeave={settleIndicator}
          >
            <span ref={indicatorRef} aria-hidden className="nav-indicator" />
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onPointerEnter={(event) => moveIndicator(event.currentTarget)}
                  onFocus={(event) => moveIndicator(event.currentTarget)}
                  onBlur={settleIndicator}
                  className={cn(
                    "relative z-10 rounded-pill px-3.5 py-2 font-sans text-14 leading-native whitespace-nowrap transition-colors duration-300 ease-brand",
                    active ? "font-semibold text-primary-bright" : "font-medium text-body hover:text-heading",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <a href={contact.phoneHref} aria-label={`Call ${contact.phone}`} className={iconButton}>
                <PhoneCall className="size-4" aria-hidden />
              </a>
              {contact.whatsappHref ? (
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat on WhatsApp"
                  className={cn(
                    iconButton,
                    "border-whatsapp-line bg-whatsapp-soft text-whatsapp hover:border-whatsapp/60 hover:bg-whatsapp/25 hover:text-whatsapp hover:shadow-[0_10px_24px_-10px_rgb(37_211_102/0.6)]",
                  )}
                >
                  <WhatsAppIcon className="size-[18px]" />
                </a>
              ) : null}
            </div>
            <div className="hidden sm:block">
              <Button href={routes.contact} className="min-h-10 px-5 py-2 text-14 md:min-h-11">
                Enquire Now
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(iconButton, "rounded-sm xl:hidden")}
            >
              <span className={cn("flex transition-transform duration-300 ease-brand", open && "rotate-90")}>
                {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
              </span>
            </button>
          </div>

          {/* Reading progress along the shell's bottom edge. */}
          <div
            ref={progressRef}
            aria-hidden
            className="scroll-progress pointer-events-none absolute inset-x-5 -bottom-px h-px rounded-full"
          />
        </div>
      </Container>

      {/* Mobile drawer: a sibling of the shell, so the shell's backdrop filter
          never becomes its containing block. */}
      <div
        id="mobile-nav"
        className={cn(
          "nav-drawer fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto border-t border-line transition-[opacity,translate] duration-200 ease-brand md:top-20 xl:hidden",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
        aria-hidden={!open}
      >
        <Container className="flex flex-col gap-6 py-6">
          <nav aria-label="Mobile" className="flex flex-col">
            {navItems.map((item, index) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  tabIndex={open ? 0 : -1}
                  style={{ transitionDelay: open ? `${60 + index * 45}ms` : "0ms" }}
                  className={cn(
                    "flex items-center justify-between border-b border-line py-4 font-sans text-18 leading-native transition-[color,opacity,translate] duration-300 ease-brand",
                    open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
                    active ? "font-semibold text-primary-bright" : "font-medium text-body hover:text-heading",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn("size-1.5 rounded-full", active ? "bg-primary shadow-[0_0_10px_rgb(255_90_31/0.9)]" : "bg-line-strong")}
                  />
                </Link>
              );
            })}
          </nav>
          <div
            style={{ transitionDelay: open ? `${60 + navItems.length * 45}ms` : "0ms" }}
            className={cn(
              "flex flex-col gap-3 transition-[opacity,translate] duration-300 ease-brand",
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
          >
            <Button href={routes.contact} fullWidth tabIndex={open ? 0 : -1}>
              Enquire Now
            </Button>
            <div className="flex gap-3">
              <Button
                href={contact.phoneHref}
                variant="secondary"
                className="flex-1"
                tabIndex={open ? 0 : -1}
              >
                <PhoneCall className="size-4" aria-hidden />
                Call
              </Button>
              {contact.whatsappHref ? (
                <Button
                  href={contact.whatsappHref}
                  variant="whatsapp"
                  className="flex-1"
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={open ? 0 : -1}
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
