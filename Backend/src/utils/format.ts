/** `12` → "12 Weeks" */
export function formatWeeks(weeks: number): string {
  return `${weeks} ${weeks === 1 ? "Week" : "Weeks"}`;
}

/** `12` → "3 Months", `6` → "1.5 Months", `4` → "1 Month" */
export function formatMonths(weeks: number): string {
  const months = Math.round((weeks / 4) * 10) / 10;
  return `${months} ${months === 1 ? "Month" : "Months"}`;
}

/** `12` → "12 Weeks (3 Months)" — the label used by the admin duration select. */
export function formatDurationOption(weeks: number): string {
  return `${formatWeeks(weeks)} (${formatMonths(weeks)})`;
}

/** `12` → "12+ Years" */
export function formatExperience(years: number): string {
  return `${years}+ Years`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Splits "a, b\nc" into ["a", "b", "c"], dropping blanks. */
export function splitList(input: string | string[] | null | undefined): string[] {
  if (!input) return [];
  const parts = Array.isArray(input) ? input : input.split(/[\n,]/);
  return parts.map((s) => s.trim()).filter(Boolean);
}
