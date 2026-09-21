/**
 * Builds a syllabus PDF from the course content managed in the admin console,
 * for courses that have no uploaded PDF. Sections whose fields are empty are
 * left out, so a sparsely filled course still produces a tidy one-pager.
 */
import { PdfDocument, paragraphs, sanitize, widthOf, type FontName, type RGB } from "@/lib/pdf";
import type { RgbImage } from "@/lib/png";
import type { CourseDetail, SiteSettings } from "@/types";

// Brand palette from globals.css.
const NAVY: RGB = [15 / 255, 23 / 255, 42 / 255]; // --color-heading
const BODY: RGB = [30 / 255, 41 / 255, 59 / 255]; // --color-body
const MUTED: RGB = [91 / 255, 101 / 255, 119 / 255]; // --color-muted
const LINE: RGB = [214 / 255, 214 / 255, 219 / 255]; // --color-line
const ORANGE: RGB = [1, 90 / 255, 31 / 255]; // --color-primary
const ORANGE_SOFT: RGB = [1, 0.94, 0.91]; // --color-primary-soft on paper
const PAPER: RGB = [243 / 255, 243 / 255, 243 / 255]; // --color-canvas
const WHITE: RGB = [1, 1, 1];

const HEADER_HEIGHT = 84;
const LOGO_SIZE = 50;
const BULLET_INDENT = 14;

function truncate(text: string, font: FontName, size: number, maxWidth: number): string {
  if (widthOf(text, font, size) <= maxWidth) return text;
  let out = text;
  while (out && widthOf(`${out}\u2026`, font, size) > maxWidth) out = out.slice(0, -1);
  return `${out.trimEnd()}\u2026`;
}

export type SyllabusPdfOptions = {
  /** Brand emblem for the letterhead; the wordmark alone is used when null. */
  logo?: RgbImage | null;
  /** Host shown in the contact block (e.g. "bimcareer.in"); omitted when unknown. */
  website?: string | null;
  /** Fixed for reproducible output in tests. */
  now?: Date;
};

/** Returns the PDF bytes for `course`; `site` fills in the letterhead and contact block. */
export function renderSyllabusPdf(course: CourseDetail, site: SiteSettings, options: SyllabusPdfOptions = {}): Uint8Array<ArrayBuffer> {
  const doc = new PdfDocument({ top: HEADER_HEIGHT + 32, bottom: 60 });
  const { detail } = course;
  const logo = options.logo ? doc.addImage(options.logo) : null;
  const generated = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(
    options.now ?? new Date(),
  );

  const heading = (text: string) => {
    // Keep a heading with at least a couple of lines of what follows.
    doc.ensure(52);
    doc.space(4);
    doc.text(text, doc.left, doc.y + 12, { font: "bold", size: 13, color: NAVY });
    doc.line(doc.left, doc.y + 19, doc.left + 40, doc.y + 19, ORANGE, 2);
    doc.y += 30;
  };
  const body = (text: string, after = 6) => {
    for (const para of paragraphs(text)) doc.paragraph(para, { size: 10.5, color: BODY, lineHeight: 1.5, after });
  };
  const bullets = (items: string[]) => {
    for (const item of items.map(sanitize).filter(Boolean)) {
      doc.ensure(16);
      doc.text("•", doc.left + 2, doc.y + 10.5, { size: 10.5, color: ORANGE });
      doc.paragraph(item, { size: 10.5, color: BODY, lineHeight: 1.5, x: doc.left + BULLET_INDENT, after: 2 });
    }
    doc.space(6);
  };
  const section = (title: string, render: () => void) => {
    heading(title);
    render();
    doc.space(8);
  };

  // Title block.
  const title = sanitize(course.title) || "Course syllabus";
  doc.paragraph(title, { font: "bold", size: 22, color: NAVY, lineHeight: 1.2, after: 6 });
  const strap = [course.category.name, detail.meta.mode].map(sanitize).filter(Boolean).join("  ·  ");
  if (strap) doc.paragraph(strap, { size: 11, color: MUTED, after: 14 });

  // Key facts: equal boxes with a small label and a bold value.
  const facts = [
    { label: "Duration", value: course.duration },
    { label: "Training mode", value: detail.meta.mode },
    { label: "Admissions", value: detail.meta.admissions },
  ]
    .map((f) => ({ ...f, value: sanitize(f.value) }))
    .filter((f) => f.value);
  if (facts.length) {
    const gap = 10;
    const boxWidth = (doc.contentWidth - gap * (facts.length - 1)) / facts.length;
    const innerWidth = boxWidth - 24;
    const lines = facts.map((f) => Math.max(1, doc.measure(f.value, { font: "bold", size: 11.5, lineHeight: 1.3, width: innerWidth }) / (11.5 * 1.3)));
    const boxHeight = 30 + Math.max(...lines) * 11.5 * 1.3;
    doc.ensure(boxHeight);
    facts.forEach((fact, i) => {
      const x = doc.left + i * (boxWidth + gap);
      doc.rect(x, doc.y, boxWidth, boxHeight, PAPER);
      doc.rect(x, doc.y, 3, boxHeight, ORANGE);
      doc.text(fact.label.toUpperCase(), x + 14, doc.y + 17, { size: 7.5, color: MUTED });
      const top = doc.y;
      doc.y = top + 22;
      doc.paragraph(fact.value, { font: "bold", size: 11.5, color: NAVY, lineHeight: 1.3, x: x + 14, width: innerWidth });
      doc.y = top;
    });
    doc.y += boxHeight + 22;
  } else {
    doc.space(8);
  }

  const overview = detail.overview || course.description;
  if (paragraphs(overview).length) section("Course Overview", () => body(overview));
  if (paragraphs(detail.whoShouldJoin).length) section("Who Should Join", () => body(detail.whoShouldJoin));
  if (paragraphs(detail.eligibility).length) section("Eligibility", () => body(detail.eligibility));

  const outcomes = detail.outcomes.map(sanitize).filter(Boolean);
  if (outcomes.length) section("What You Will Learn", () => bullets(outcomes));

  const modules = detail.modules.map((m) => ({ title: sanitize(m.title), description: m.description })).filter((m) => m.title);
  if (modules.length) {
    section("Course Modules", () => {
      modules.forEach((module, i) => {
        const label = String(i + 1).padStart(2, "0");
        const labelWidth = widthOf("00", "bold", 11) + 12;
        const titleHeight = doc.measure(module.title, { font: "bold", size: 11.5, lineHeight: 1.35, width: doc.contentWidth - labelWidth });
        const firstPara = paragraphs(module.description)[0];
        // Keep the module title together with its first line of description.
        doc.ensure(titleHeight + (firstPara ? 16 : 0) + 8);
        doc.text(label, doc.left, doc.y + 11.5, { font: "bold", size: 11, color: ORANGE });
        doc.paragraph(module.title, { font: "bold", size: 11.5, color: NAVY, lineHeight: 1.35, x: doc.left + labelWidth, after: 2 });
        for (const para of paragraphs(module.description)) {
          doc.paragraph(para, { size: 10.5, color: BODY, lineHeight: 1.5, x: doc.left + labelWidth, after: 4 });
        }
        doc.space(6);
      });
    });
  }

  const software = detail.software.map(sanitize).filter(Boolean);
  if (software.length) section("Software Covered", () => bullets(software));
  const careers = detail.careers.map(sanitize).filter(Boolean);
  if (careers.length) section("Career Opportunities", () => bullets(careers));

  // Closing contact block.
  const contactLines = [
    site.contact.phone && `Phone: ${site.contact.phone}`,
    site.contact.whatsapp && site.contact.whatsapp !== site.contact.phone && `WhatsApp: ${site.contact.whatsapp}`,
    site.contact.email && `Email: ${site.contact.email}`,
    options.website && `Website: ${options.website}`,
    site.contact.address && `Address: ${site.contact.address}`,
    site.contact.hours && `Hours: ${site.contact.hours}`,
  ]
    .filter((line): line is string => Boolean(line))
    .map(sanitize);
  const innerWidth = doc.contentWidth - 36;
  const contactHeight = 46 + contactLines.reduce((h, line) => h + doc.measure(line, { size: 10, lineHeight: 1.5, width: innerWidth }), 0);
  doc.ensure(contactHeight + 8);
  doc.space(4);
  const top = doc.y;
  doc.rect(doc.left, top, doc.contentWidth, contactHeight, ORANGE_SOFT);
  doc.rect(doc.left, top, 3, contactHeight, ORANGE);
  doc.text("Ready to enrol? Talk to our admissions team.", doc.left + 18, top + 22, { font: "bold", size: 11.5, color: NAVY });
  doc.y = top + 34;
  for (const line of contactLines) doc.paragraph(line, { size: 10, color: BODY, lineHeight: 1.5, x: doc.left + 18, width: innerWidth });
  doc.y = top + contactHeight;

  const siteName = sanitize(site.name) || "Course syllabus";
  return doc.build({ title: `${title} – Syllabus`, author: siteName, subject: `Syllabus for ${title}` }, (page, total) => {
    // Letterhead: emblem + wordmark, like the site header.
    doc.rect(0, 0, doc.width, HEADER_HEIGHT, NAVY);
    doc.rect(0, HEADER_HEIGHT, doc.width, 3, ORANGE);
    let textLeft = doc.left;
    if (logo && options.logo) {
      const { width, height } = options.logo;
      const w = (LOGO_SIZE * width) / Math.max(width, height);
      const h = (LOGO_SIZE * height) / Math.max(width, height);
      doc.image(logo, doc.left, (HEADER_HEIGHT - h) / 2, w, h);
      textLeft += w + 12;
    }
    doc.text(siteName, textLeft, 40, { font: "bold", size: 17, color: WHITE });
    doc.text(sanitize(course.category.badge || "Course").toUpperCase() + "  ·  SYLLABUS", textLeft, 58, { size: 8.5, color: [0.78, 0.82, 0.9] });
    doc.textRight(`Issued ${generated}`, doc.right, 58, { size: 8.5, color: [0.78, 0.82, 0.9] });
    if (page > 1) {
      const available = doc.right - (textLeft + widthOf(siteName, "bold", 17) + 24);
      doc.textRight(truncate(title, "regular", 9, available), doc.right, 40, { size: 9, color: WHITE });
    }

    // Footer.
    const footerY = doc.height - 38;
    doc.line(doc.left, footerY - 12, doc.right, footerY - 12, LINE, 0.5);
    const contact = [siteName, site.contact.phone, site.contact.email].map(sanitize).filter(Boolean).join("  ·  ");
    doc.text(contact, doc.left, footerY, { size: 8, color: MUTED });
    doc.textRight(`Page ${page} of ${total}`, doc.right, footerY, { size: 8, color: MUTED });
  });
}
