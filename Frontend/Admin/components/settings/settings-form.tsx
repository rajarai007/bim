"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { ImagePicker } from "@/components/ui/image-picker";
import { saveSettings } from "@/features/settings/actions";
import { mediaUrl } from "@/lib/media";
import type { AcademySettings, ActionState } from "@/types";
import { cn } from "@/lib/utils";

const tabs = ["Academy Info", "Social Media", "Integration API"] as const;
type Tab = (typeof tabs)[number];

export function SettingsForm({ settings }: { settings: AcademySettings }) {
  const [tab, setTab] = useState<Tab>("Academy Info");
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logoUrl);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveSettings, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <input type="hidden" name="tab" value={tab} />
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Settings sections" className="flex flex-wrap items-start gap-2">
          {tabs.map((t) => {
            const selected = t === tab;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-sm px-5 py-2.5 font-sans text-14 leading-native transition-colors duration-150 ease-brand",
                  selected
                    ? "border border-primary bg-card font-bold text-primary"
                    : "border border-transparent font-medium text-body hover:text-ink",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <FormStatus message={state?.ok ? state.message : undefined} error={state?.error} />
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div role="tabpanel" className="flex w-full flex-col items-start gap-6 xl:flex-row">
        <div className="flex w-full min-w-0 flex-col xl:flex-1">
          {tab === "Academy Info" ? <AcademyInfoCard settings={settings} errors={errors} logoUrl={logoUrl} onLogoChange={setLogoUrl} /> : null}
          {tab === "Social Media" ? <SocialCard settings={settings} errors={errors} full /> : null}
          {tab === "Integration API" ? <IntegrationCard settings={settings} errors={errors} /> : null}
        </div>
        {tab === "Academy Info" ? (
          <div className="flex w-full flex-col gap-6 xl:w-[440px] xl:shrink-0">
            <SocialCard settings={settings} errors={errors} />
            <Notice />
          </div>
        ) : null}
      </div>
    </form>
  );
}

type CardProps = { settings: AcademySettings; errors: Record<string, string> };

function AcademyInfoCard({
  settings,
  errors,
  logoUrl,
  onLogoChange,
}: CardProps & { logoUrl: string | null; onLogoChange: (url: string | null) => void }) {
  const [showUpload, setShowUpload] = useState(false);
  return (
    <Card className="flex w-full flex-col gap-5 p-6">
      <CardTitle size="lg">Academy Profile Details</CardTitle>
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar font-heading text-32 font-normal leading-native text-primary">
          {logoUrl ? <Image src={mediaUrl(logoUrl)} alt="Academy logo" fill sizes="80px" className="object-contain p-2" /> : "B"}
        </span>
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" onClick={() => setShowUpload((v) => !v)}>
              {showUpload ? "Hide Uploader" : "Upload New Logo"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onLogoChange(null)} disabled={!logoUrl}>
              Remove
            </Button>
          </div>
          <p className="font-sans text-11 leading-native text-muted">
            Square vector SVG or high-res PNG (min. 512x512px)
          </p>
        </div>
      </div>
      {showUpload ? (
        <ImagePicker name="logoUrl" value={logoUrl} onChange={onLogoChange} shape="square" label="Click to upload logo" hint="SVG or PNG up to 5MB" />
      ) : (
        <input type="hidden" name="logoUrl" value={logoUrl ?? ""} />
      )}
      <hr className="w-full border-0 border-t border-line" />
      <div className="flex w-full flex-col gap-4">
        <Field label="Academy Name *" htmlFor="academyName" error={errors.academyName}>
          <Input id="academyName" name="academyName" required defaultValue={settings.academyName} />
        </Field>
        <Field label="Official Address *" htmlFor="address" error={errors.address}>
          <Textarea id="address" name="address" required defaultValue={settings.address} />
        </Field>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <Field label="Phone Number *" htmlFor="phone" error={errors.phone}>
            <Input id="phone" name="phone" type="tel" required defaultValue={settings.phone} />
          </Field>
          <Field label="WhatsApp Number" htmlFor="whatsapp" error={errors.whatsapp}>
            <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={settings.whatsapp ?? ""} />
          </Field>
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <Field label="Primary Support Email *" htmlFor="email" error={errors.email}>
            <Input id="email" name="email" type="email" required defaultValue={settings.email} />
          </Field>
          <Field label="Working Hours" htmlFor="hours" error={errors.workingHours}>
            <Input id="hours" name="hours" defaultValue={settings.workingHours ?? ""} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function SocialCard({ settings, errors, full = false }: CardProps & { full?: boolean }) {
  const fields = [
    { id: "instagram", label: "Instagram Feed", value: settings.instagramUrl, error: errors.instagramUrl },
    { id: "facebook", label: "Facebook Page", value: settings.facebookUrl, error: errors.facebookUrl },
    { id: "linkedin", label: "LinkedIn Corporate", value: settings.linkedinUrl, error: errors.linkedinUrl },
    { id: "youtube", label: "YouTube Channel", value: settings.youtubeUrl, error: errors.youtubeUrl },
  ];
  return (
    <Card className="flex w-full flex-col gap-4 p-6">
      <CardTitle>Social Channels Integration</CardTitle>
      <p className="font-sans text-12 leading-native text-muted">
        Provide URL feeds to sync social icons in global headers and footers.
      </p>
      <div className={cn("flex w-full flex-col gap-4", full && "md:grid md:grid-cols-2")}>
        {fields.map((f) => (
          <Field key={f.id} label={f.label} htmlFor={f.id} error={f.error}>
            <Input id={f.id} name={f.id} type="url" defaultValue={f.value ?? ""} placeholder="https://…" />
          </Field>
        ))}
      </div>
    </Card>
  );
}

function IntegrationCard({ settings, errors }: CardProps) {
  return (
    <Card className="flex w-full flex-col gap-4 p-6">
      <CardTitle>Integration API</CardTitle>
      <p className="font-sans text-12 leading-native text-muted">
        Endpoint used by the public website to submit enquiries, plus optional third-party integrations.
      </p>
      <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-2">
        <Field label="Public Enquiry Endpoint" htmlFor="enquiryEndpoint" hint="Called by the website contact and course enquiry forms (read-only).">
          <Input id="enquiryEndpoint" name="enquiryEndpoint" readOnly value={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/enquiries`} />
        </Field>
        <Field label="Webhook URL (CRM sync)" htmlFor="webhook" hint="Receives a POST for every new lead." error={errors.webhookUrl}>
          <Input id="webhook" name="webhook" type="url" defaultValue={settings.webhookUrl ?? ""} placeholder="https://crm.example.com/hooks/bim" />
        </Field>
        <Field label="WhatsApp Business Number" htmlFor="waNumber" error={errors.whatsapp}>
          <Input id="waNumber" name="waNumber" type="tel" defaultValue={settings.whatsapp ?? ""} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Google Analytics Measurement ID" htmlFor="ga" error={errors.gaMeasurementId} hint="Injected into the public website when set.">
          <Input id="ga" name="ga" defaultValue={settings.gaMeasurementId ?? ""} placeholder="G-XXXXXXXXXX" />
        </Field>
      </div>
    </Card>
  );
}

function Notice() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-primary bg-primary-tint p-5">
      <p className="font-sans text-13 font-bold leading-native text-primary">Note regarding modifications:</p>
      <p className="font-sans text-12 leading-[18px] text-body">
        Changes saved on this panel sync in real-time to the active website. Please review contact numbers and
        emails before committing.
      </p>
    </div>
  );
}
