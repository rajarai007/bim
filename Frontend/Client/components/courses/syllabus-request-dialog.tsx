"use client";

import { Download, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { submitEnquiry } from "@/features/enquiry/actions";
import { validateEnquiry, type EnquiryErrors, type EnquiryPayload } from "@/features/enquiry/schema";

type Status = "idle" | "submitting" | "success" | "error";
/** `closing` keeps the node mounted while the exit animation plays. */
type DialogState = "closed" | "open" | "closing";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Must cover the longest exit animation in globals.css (modal-drop / modal-fade). */
const CLOSE_MS = 260;
/** Stagger index for `.modal-item` / `.modal-sheet-line` (see globals.css). */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * "Download Syllabus" CTA on the course page. Instead of linking straight to
 * the PDF it opens a small enquiry popup (course, name, mobile, email); the
 * enquiry is stored with the `syllabus_download` source and the PDF download
 * starts as soon as it is accepted.
 */
export function SyllabusRequestDialog({
  courseTitle,
  courseSlug,
  href,
}: {
  courseTitle: string;
  courseSlug: string;
  /** Same-origin syllabus route (served with `Content-Disposition: attachment`). */
  href: string;
}) {
  const [state, setState] = useState<DialogState>("closed");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setState((s) => (s === "open" ? "closing" : s));
  }, []);

  // Unmount once the exit animation has played, then hand focus back to the CTA.
  useEffect(() => {
    if (state !== "closing") return;
    const timer = window.setTimeout(() => {
      setState("closed");
      triggerRef.current?.focus({ preventScroll: true });
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <>
      <Button ref={triggerRef} type="button" variant="outline" size="lg" onClick={() => setState("open")}>
        <Download className="size-4" aria-hidden />
        Download Syllabus
      </Button>
      {state !== "closed"
        ? createPortal(
            <SyllabusModal state={state} courseTitle={courseTitle} courseSlug={courseSlug} href={href} onClose={close} />,
            document.body,
          )
        : null}
    </>
  );
}

function SyllabusModal({
  state,
  courseTitle,
  courseSlug,
  href,
  onClose,
}: {
  state: DialogState;
  courseTitle: string;
  courseSlug: string;
  href: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descId = useId();

  const [values, setValues] = useState<EnquiryPayload>({ fullName: "", mobile: "", email: "", course: courseSlug });
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // Lock page scroll without a layout jump (keep the scrollbar's width as padding).
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const gutter = window.innerWidth - root.clientWidth;
    const previous = { overflow: root.style.overflow, padding: body.style.paddingRight };
    root.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    return () => {
      root.style.overflow = previous.overflow;
      body.style.paddingRight = previous.padding;
    };
  }, []);

  // Focus the first field once the sheet has started rising; Escape closes.
  useEffect(() => {
    const timer = window.setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), 120);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Keep Tab inside the panel while it is open.
  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const update = <K extends keyof EnquiryPayload>(key: K, value: EnquiryPayload[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const startDownload = () => {
    const a = document.createElement("a");
    a.href = href;
    a.download = "";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateEnquiry(values, { requireEmail: true });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStatus("submitting");
    setServerMessage(null);
    try {
      const result = await submitEnquiry(values, "syllabus_download");
      if (result.ok) {
        setStatus("success");
        startDownload();
      } else {
        setErrors(result.errors);
        setServerMessage(result.message);
        setStatus("error");
      }
    } catch {
      setServerMessage(null);
      setStatus("error");
    }
  };

  return (
    <div className="modal-root" data-state={state} onKeyDown={trapTab}>
      <div className="modal-backdrop" onClick={onClose} aria-hidden />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="modal-panel">
        {/* Light source behind the sheet so the glass has something to refract. */}
        <div aria-hidden className="panel-glow pointer-events-none absolute -inset-6 -z-10" />
        <div className="modal-sheet glass-strong glass-edge relative rounded-[inherit] p-6 shadow-[var(--shadow-sheet-lifted)] sm:p-8">

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="group/close absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full text-muted transition-[background-color,color,rotate] duration-300 ease-brand hover:bg-elevated hover:text-heading hover:rotate-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="size-4" aria-hidden />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-5 py-4 text-center" role="status" aria-live="polite">
            <span className="modal-check flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent shadow-[0_0_0_10px_rgb(10_158_138/0.08)]">
              <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12.5 10 17.5 19 7.5" />
              </svg>
            </span>
            <div className="modal-item flex flex-col gap-2" style={order(1)}>
              <h2 id={titleId} className="font-heading text-22 font-extrabold leading-native text-heading">
                Your syllabus is downloading
              </h2>
              <p id={descId} className="font-sans text-14 leading-body text-muted">
                Thanks, {values.fullName.trim().split(/\s+/)[0]}. Our admissions team will reach out about {courseTitle} shortly.
              </p>
            </div>
            <div className="modal-item flex w-full flex-col items-center gap-3" style={order(2)}>
              <Button type="button" onClick={onClose} fullWidth>
                Done
              </Button>
              <a
                href={href}
                download
                className="font-sans text-13 font-semibold text-primary underline-offset-4 transition-colors hover:underline"
              >
                Didn&apos;t start? Download again
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex w-full flex-col items-start gap-4">
            <div className="modal-item flex w-full items-start gap-4 pr-8" style={order(0)}>
              <SheetIcon />
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2 id={titleId} className="font-heading text-22 font-extrabold leading-native text-heading">
                  Get the syllabus
                </h2>
                <p id={descId} className="font-sans text-14 leading-body text-muted">
                  Tell us where to reach you and the PDF downloads right away.
                </p>
              </div>
            </div>

            <Field label="Interested Course" htmlFor="syl-course" className="modal-item w-full" style={order(1)}>
              <Input id="syl-course" name="course" surface="elevated" value={courseTitle} readOnly className="text-heading" />
            </Field>
            <Field label="Full Name" htmlFor="syl-fullName" error={errors.fullName} className="modal-item w-full" style={order(2)}>
              <Input
                ref={firstFieldRef}
                id="syl-fullName"
                name="fullName"
                autoComplete="name"
                placeholder="eg. Suresh Kumar"
                value={values.fullName}
                invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "syl-fullName-error" : undefined}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>
            <Field label="Phone Number" htmlFor="syl-mobile" error={errors.mobile} className="modal-item w-full" style={order(3)}>
              <Input
                id="syl-mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                placeholder="eg. +91 98765 12345"
                value={values.mobile}
                invalid={Boolean(errors.mobile)}
                aria-describedby={errors.mobile ? "syl-mobile-error" : undefined}
                onChange={(e) => update("mobile", e.target.value)}
              />
            </Field>
            <Field label="Email Address" htmlFor="syl-email" error={errors.email} className="modal-item w-full" style={order(4)}>
              <Input
                id="syl-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="eg. suresh@example.com"
                value={values.email}
                invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "syl-email-error" : undefined}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>

            <div className="modal-item flex w-full flex-col gap-3" style={order(5)}>
              <Button type="submit" fullWidth disabled={status === "submitting"}>
                <Download className="size-4" aria-hidden />
                {status === "submitting" ? "Preparing your PDF…" : "Download Syllabus"}
              </Button>
              <p role="status" aria-live="polite" className="font-sans text-13 leading-native text-primary empty:hidden">
                {status === "error" ? serverMessage ?? "Something went wrong. Please try again." : null}
              </p>
              <p className="font-sans text-12 leading-native text-muted">
                We&apos;ll only use these details to share course information with you.
              </p>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}

/** A small sheet whose lines draw themselves in — the syllabus being printed. */
function SheetIcon() {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 12h6" className="modal-sheet-line" style={order(0)} />
        <path d="M9 15h6" className="modal-sheet-line" style={order(1)} />
        <path d="M9 18h4" className="modal-sheet-line" style={order(2)} />
      </svg>
    </span>
  );
}
