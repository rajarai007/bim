"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { logout } from "@/features/auth/actions";
import { navItems, routes } from "@/lib/constants";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex w-full flex-col gap-1">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex w-full items-start gap-3 rounded-sm px-3 py-2.5 font-sans text-14 leading-native transition-colors duration-150 ease-brand",
              active
                ? "bg-primary font-bold text-white"
                : "font-medium text-sidebar-text hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className={cn("size-[18px] shrink-0", active ? "text-white" : "text-sidebar-icon")} aria-hidden />
            <span className="flex-1">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-sidebar shrink-0 bg-sidebar lg:block">
      <div className="sticky top-0 flex h-screen flex-col justify-between overflow-y-auto px-4 py-6">
        <div className="flex w-full flex-col gap-8">
          <div className="pl-2">
            <Link href={routes.dashboard} aria-label="Dashboard">
              <Logo />
            </Link>
          </div>
          <SidebarNav />
        </div>
        <SidebarFooter />
      </div>
    </aside>
  );
}

/** Profile link + logout, pinned to the bottom of the sidebar / drawer. */
export function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = isActive(pathname, routes.profile);
  return (
    <div className="flex w-full flex-col gap-1">
      <Link
        href={routes.profile}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-start gap-3 rounded-sm px-3 py-2.5 font-sans text-14 leading-native transition-colors duration-150 ease-brand",
          active ? "bg-primary font-bold text-white" : "font-medium text-sidebar-text hover:bg-white/5 hover:text-white",
        )}
      >
        <UserCircle className={cn("size-[18px] shrink-0", active ? "text-white" : "text-sidebar-icon")} aria-hidden />
        My Profile
      </Link>
      <LogoutButton />
    </div>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logout} className={cn("w-full", className)}>
      <button
        type="submit"
        className="flex w-full items-start gap-3 rounded-sm px-3 py-2.5 font-sans text-14 font-medium leading-native text-sidebar-text transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut className="size-[18px] shrink-0 text-sidebar-icon" aria-hidden />
        Logout
      </button>
    </form>
  );
}
