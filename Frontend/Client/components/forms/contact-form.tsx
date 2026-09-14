"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { submitEnquiry } from "@/features/enquiry/actions";
import {
  experienceLevels,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryPayload,
} from "@/features/enquiry/schema";

const initial: EnquiryPayload = {
  fullName: "",
  mobile: "",
  email: "",
  course: "",
  qualification: "",
  experience: "",
  message: "",
  consent: true,
};

type Status = "idle" | "submitting" | "success" | "error";

export type CourseOption = { slug: string; title: string };

export function ContactForm({ courses }: { courses: CourseOption[] }) {
  const [values, setValues] = useState<EnquiryPayload>(initial);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const update = <K extends keyof EnquiryPayload>(key: K, value: EnquiryPayload[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateEnquiry(values, { requireEmail: true, requireConsent: true });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStatus("submitting");
    setServerMessage(null);
    try {
      const result = await submitEnquiry(values, "contact_form");
      if (result.ok) {
        setStatus("success");
        setValues(initial);
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
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full flex-col gap-5 sm:flex-row sm:gap-4">
        <Field label="Full Name" htmlFor="fullName" error={errors.fullName}>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="eg. Ar. Amit Sen"
            value={values.fullName}
            invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </Field>
        <Field label="Mobile Number" htmlFor="mobile" error={errors.mobile}>
          <Input
            id="mobile"
            name="mobile"
            type="tel"
            autoComplete="tel"
            placeholder="eg. +91 98765 12345"
            value={values.mobile}
            invalid={Boolean(errors.mobile)}
            aria-describedby={errors.mobile ? "mobile-error" : undefined}
            onChange={(e) => update("mobile", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex w-full flex-col gap-5 sm:flex-row sm:gap-4">
        <Field label="Email Address" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="eg. amit.sen@aecfirm.com"
            value={values.email}
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Course Interested In" htmlFor="course">
          <Select
            id="course"
            name="course"
            placeholder="Select Specialized Program"
            value={values.course}
            onChange={(e) => update("course", e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex w-full flex-col gap-5 sm:flex-row sm:gap-4">
        <Field label="Qualification" htmlFor="qualification">
          <Input
            id="qualification"
            name="qualification"
            placeholder="eg. B.Arch / B.Tech Civil"
            value={values.qualification}
            onChange={(e) => update("qualification", e.target.value)}
          />
        </Field>
        <Field label="Experience Level" htmlFor="experience">
          <Select
            id="experience"
            name="experience"
            placeholder="eg. Professional / Student"
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
      </div>

      <Field label="Your Message / Specific Goals" htmlFor="message" className="w-full">
        <Textarea
          id="message"
          name="message"
          placeholder="Write details about your career path goals here..."
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </Field>

      <Checkbox
        id="consent"
        name="consent"
        checked={Boolean(values.consent)}
        onChange={(e) => update("consent", e.target.checked)}
        error={errors.consent}
        label="I agree to be contacted by admissions counselors regarding the course details."
      />

      <Button type="submit" fullWidth disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit Query"}
      </Button>

      <p role="status" aria-live="polite" className="min-h-4 font-sans text-13 leading-native">
        {status === "success" ? (
          <span className="text-accent">
            Thank you — your query has been received. Our counselors will reach out shortly.
          </span>
        ) : status === "error" ? (
          <span className="text-primary">{serverMessage ?? "Something went wrong. Please try again."}</span>
        ) : null}
      </p>
    </form>
  );
}
