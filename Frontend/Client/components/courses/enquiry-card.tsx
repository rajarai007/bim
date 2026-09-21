import { PhoneCall } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Divider } from "@/components/ui/divider";
import type { SiteSettings } from "@/types";

export function EnquiryCard({
  courseTitle,
  courseSlug,
  contact,
}: {
  courseTitle: string;
  courseSlug: string;
  contact: SiteSettings["contact"];
}) {
  return (
    <aside data-reveal="right" data-reveal-delay="2" className="relative w-full lg:sticky lg:top-24">
      {/* Light source behind the panel so the glass has something to refract. */}
      <div aria-hidden className="panel-glow pointer-events-none absolute -inset-6 -z-10" />
      <div className="glass-strong glass-edge flex w-full flex-col items-start gap-6 rounded-lg p-6 md:p-8">
      <h2 className="font-heading text-22 font-extrabold leading-native text-heading">
        Interested in {courseTitle}?
      </h2>
      <p className="font-sans text-14 leading-native text-muted">
        Submit your admissions enquiry or schedule a physical laboratory demo session.
      </p>
      <EnquiryForm courseTitle={courseTitle} courseSlug={courseSlug} />
      <Divider />
      <ul className="flex w-full flex-col gap-3">
        {contact.whatsappHref ? (
          <li>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center gap-3 font-sans text-14 font-semibold leading-native text-body transition-colors hover:text-heading"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-whatsapp-soft text-whatsapp transition-[scale,box-shadow] duration-300 ease-brand group-hover:scale-110 group-hover:shadow-[0_0_0_5px_rgb(37_211_102/0.12)]">
                <WhatsAppIcon className="size-3.5" />
              </span>
              Connect via WhatsApp
            </a>
          </li>
        ) : null}
        <li>
          <a
            href={contact.phoneHref}
            className="group flex w-full items-center gap-3 font-sans text-14 font-semibold leading-native text-body transition-colors hover:text-heading"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-[scale,box-shadow] duration-300 ease-brand group-hover:scale-110 group-hover:shadow-[0_0_0_5px_rgb(255_90_31/0.12)]">
              <PhoneCall className="size-3.5" aria-hidden />
            </span>
            {contact.phone}
          </a>
        </li>
      </ul>
      </div>
    </aside>
  );
}
