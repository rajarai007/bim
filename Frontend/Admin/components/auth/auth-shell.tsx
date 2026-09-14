import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";

/** Centered card used by the login / forgot / reset screens (matches the admin-login frame). */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-page px-4 py-10">
      {/* Background glows (blurred 10% brand circles, as designed) */}
      <div aria-hidden className="pointer-events-none absolute top-[100px] left-[100px] size-[500px] rounded-pill bg-primary/10 blur-[50px]" />
      <div aria-hidden className="pointer-events-none absolute top-[400px] left-[900px] size-[400px] rounded-pill bg-teal/10 blur-[60px]" />

      <section className="relative flex w-full max-w-[440px] flex-col gap-8 rounded-xl border border-line bg-card p-6 shadow-panel sm:p-10">
        <header className="flex w-full flex-col items-center gap-6">
          <Logo variant="full" />
          <div className="flex w-full flex-col items-center gap-1.5 text-center leading-native">
            <h1 className="font-heading text-24 font-extrabold text-ink">{title}</h1>
            <p className="font-sans text-14 text-body">{subtitle}</p>
          </div>
        </header>
        {children}
        <p className="w-full text-center font-sans text-12 leading-native text-muted">
          Authorized Personnel Only. IP is being logged.
        </p>
      </section>
    </main>
  );
}
