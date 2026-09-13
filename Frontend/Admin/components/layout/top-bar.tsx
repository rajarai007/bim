"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { SidebarFooter, SidebarNav } from "@/components/layout/sidebar";
import { adminConfig } from "@/lib/config";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TopBarUser = { name: string; role: string; avatar: string };

export function TopBar({ title, user }: { title: string; user: TopBarUser }) {
  const [open, setOpen] = useState(false);
  const { consoleVersion } = adminConfig;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-topbar w-full items-center justify-between border-b border-line bg-card px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="admin-drawer"
            className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-page text-body lg:hidden"
          >
            <Menu className="size-[18px]" aria-hidden />
          </button>
          <h1 className="truncate font-heading text-18 font-extrabold leading-native text-ink md:text-22">
            {title}
          </h1>
          <span className="hidden rounded-xs bg-page px-2 py-0.5 font-sans text-11 font-semibold leading-native text-body whitespace-nowrap sm:inline-flex">
            {consoleVersion}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="flex size-9 items-center justify-center rounded-pill bg-page text-body transition-colors hover:bg-line/60"
          >
            <Bell className="size-[18px]" aria-hidden />
          </button>
          <span aria-hidden className="h-6 w-px bg-line" />
          <Link
            href={routes.profile}
            aria-label="My profile"
            className="flex items-center gap-3 rounded-sm transition-colors hover:bg-page sm:-mx-2 sm:px-2 sm:py-1"
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded-pill bg-page">
              <Image src={user.avatar} alt="" fill sizes="36px" className="object-cover" />
            </span>
            <span className="hidden flex-col gap-0.5 leading-native whitespace-nowrap sm:flex">
              <span className="font-sans text-13 font-bold text-ink">{user.name}</span>
              <span className="font-sans text-11 text-body">{user.role}</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Mobile / tablet drawer */}
      <div
        id="admin-drawer"
        aria-hidden={!open}
        className={cn("fixed inset-0 z-40 lg:hidden", open ? "" : "pointer-events-none")}
      >
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/50 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-sidebar max-w-[85vw] flex-col justify-between bg-sidebar px-4 py-6 transition-transform duration-200 ease-brand",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex w-full flex-col gap-8">
            <div className="flex items-center justify-between pl-2">
              <Link href={routes.dashboard} aria-label="Dashboard" onClick={() => setOpen(false)}>
                <Logo />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                tabIndex={open ? 0 : -1}
                className="flex size-9 items-center justify-center rounded-sm text-sidebar-text hover:bg-white/5"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
          <SidebarFooter onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}
