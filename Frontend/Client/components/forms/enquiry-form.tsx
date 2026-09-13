"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { submitEnquiry } from "@/features/enquiry/actions";
import {
  experienceLevels,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryPayload,
} from "@/features/enquiry/schema";

type Status = "idle" | "submitting" | "success" | "error";

/** Compact sidebar enquiry form on the course detail page. */
export function EnquiryForm({ courseTitle, courseSlug }: { courseTitle: string; courseSlug: string }) {
  const [values, setValues] = useState<EnquiryPayload>({
    fullName: "",
    mobile: "",
    experience: "",
    course: courseSlug,
  });
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const update = <K extends keyof EnquiryPayload>(key: K, value: EnquiryPayload[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateEnquiry(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStatus("submitting");
    setServerMessage(null);
    try {
      const result = await submitEnquiry(values, "course_page");
      if (result.ok) {
        setStatus("success");
        setValues((v) => ({ ...v, fullName: "", mobile: "", experience: "" }));
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
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col items-start gap-4">
      <Field label="Course Program" htmlFor="enq-course" className="w-full">
        <Input
          id="enq-course"
          name="course"
          surface="elevated"
          value={courseTitle}
          readOnly
          className="text-white"
        />
      </Field>
      <Field label="Full Name" htmlFor="enq-fullName" error={errors.fullName} className="w-full">
        <Input
          id="enq-fullName"
          name="fullName"
          surface="canvas"
          autoComplete="name"
          placeholder="eg. Suresh Kumar"
          value={values.fullName}
          invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "enq-fullName-error" : undefined}
          onChange={(e) => update("fullName", e.target.value)}
        />
      </Field>
      <Field label="Mobile Number" htmlFor="enq-mobile" error={errors.mobile} className="w-full">
        <Input
          id="enq-mobile"
          name="mobile"
          type="tel"
          surface="canvas"
          autoComplete="tel"
          placeholder="eg. +91 98765 43210"
          value={values.mobile}
          invalid={Boolean(errors.mobile)}
          aria-describedby={errors.mobile ? "enq-mobile-error" : undefined}
          onChange={(e) => update("mobile", e.target.value)}
        />
      </Field>
      <Field label="Experience Level" htmlFor="enq-experience" className="w-full">
        <Select
          id="enq-experience"
          name="experience"
          surface="canvas"
          chevron="wide"
          placeholder="eg. B.Arch / B.Tech Civil"
          value={values.experience}
          onChange={(e) => update("experience", e.target.value)}
        >
          {experienceLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" fullWidth disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit Query"}
      </Button>
      <p role="status" aria-live="polite" className="font-sans text-13 leading-native empty:hidden">
        {status === "success" ? (
          <span className="text-accent">Thank you — we&apos;ll be in touch shortly.</span>
        ) : status === "error" ? (
          <span className="text-primary">{serverMessage ?? "Something went wrong. Please try again."}</span>
        ) : null}
      </p>
    </form>
  );
}
