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

  // One indicator slides between nav links: it follows the hovered link and
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

  // Frost the header once the page scrolls and drive the reading-progress bar.
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

  return (
    <header
      className={cn(
        "header-in sticky top-0 z-50 w-full border-b border-line transition-shadow duration-300 ease-brand",
        scrolled && "shadow-[0_12px_32px_-16px_rgb(15_23_42/0.18)]",
      )}
    >
      {/* Frosted backdrop lives on its own layer: backdrop-filter on the
          header itself would become the containing block for the fixed
          mobile drawer below. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 transition-[background-color,backdrop-filter] duration-300 ease-brand",
          scrolled ? "bg-canvas/70 backdrop-blur-xl backdrop-saturate-150" : "bg-canvas",
        )}
      />
      <Container className="flex h-16 items-center justify-between xl:h-20">
        <Logo />

        <nav
          ref={navRef}
          aria-label="Primary"
          className="relative hidden items-center gap-6 xl:flex"
          onPointerLeave={settleIndicator}
        >
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
                  "py-2 font-sans text-14 leading-native whitespace-nowrap transition-colors duration-300 ease-brand",
                  active
                    ? "font-bold text-primary"
                    : "font-medium text-body hover:text-heading",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <span
            ref={indicatorRef}
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary opacity-0 transition-[transform,width,opacity] duration-500 ease-out-expo"
          />
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-start gap-2 md:flex">
            <a
              href={contact.phoneHref}
              aria-label={`Call ${contact.phone}`}
              className="flex size-9 items-center justify-center rounded-full bg-surface text-body transition-[background-color,color,translate,scale,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:bg-elevated hover:text-heading hover:shadow-[0_8px_20px_-8px_rgb(15_23_42/0.18)] active:translate-y-0 active:scale-95"
            >
              <PhoneCall className="size-4" aria-hidden />
            </a>
            {contact.whatsappHref ? (
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex size-9 items-center justify-center rounded-full border border-whatsapp-line bg-whatsapp-soft text-whatsapp transition-[background-color,translate,scale,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:bg-whatsapp/25 hover:shadow-[0_8px_20px_-8px_rgb(37_211_102/0.6)] active:translate-y-0 active:scale-95"
              >
                <WhatsAppIcon className="size-[18px]" />
              </a>
            ) : null}
          </div>
          <div className="hidden sm:block">
            <Button href={routes.contact}>Enquire Now</Button>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-10 items-center justify-center rounded-sm border border-line bg-surface text-body transition-[color,border-color,scale] duration-200 ease-brand hover:border-primary/50 hover:text-heading active:scale-95 xl:hidden"
          >
            <span
              className={cn(
                "flex transition-transform duration-300 ease-brand",
                open && "rotate-90",
              )}
            >
              {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </span>
          </button>
        </div>
      </Container>

      {/* Reading progress */}
      <div
        ref={progressRef}
        aria-hidden
        className="scroll-progress pointer-events-none absolute inset-x-0 -bottom-px h-0.5"
      />

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-canvas transition-[opacity,translate] duration-200 ease-brand xl:hidden",
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
                    "border-b border-line py-4 font-sans text-16 leading-native transition-[color,opacity,translate] duration-300 ease-brand",
                    open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
                    active ? "font-bold text-primary" : "font-medium text-body hover:text-primary",
                  )}
                >
                  {item.label}
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
