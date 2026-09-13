/**
 * Enquiry / contact form contract shared by the client-side validation and
 * the future API route. Keep this the single source of truth for field names.
 */
export type EnquiryPayload = {
  fullName: string;
  mobile: string;
  email?: string;
  course?: string;
  qualification?: string;
  experience?: string;
  message?: string;
  consent?: boolean;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryPayload, string>>;

const MOBILE_RE = /^\+?[0-9\s-]{10,16}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(
  values: EnquiryPayload,
  options: { requireEmail?: boolean; requireConsent?: boolean } = {},
): EnquiryErrors {
  const errors: EnquiryErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Please enter your full name.";
  if (!values.mobile.trim()) errors.mobile = "Please enter your mobile number.";
  else if (!MOBILE_RE.test(values.mobile.trim()))
    errors.mobile = "Enter a valid mobile number.";

  if (options.requireEmail || values.email?.trim()) {
    if (!values.email?.trim()) errors.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(values.email.trim()))
      errors.email = "Enter a valid email address.";
  }

  if (options.requireConsent && !values.consent)
    errors.consent = "Please agree to be contacted.";

  return errors;
}

export const experienceLevels = ["Student", "Fresher", "Professional"] as const;
