/**
 * Minimal PDF writer: A4 pages, the standard Helvetica pair (which every
 * viewer ships, so no font embedding), word-wrapped text, filled boxes, rules
 * and raster images. Hand-rolled instead of a PDF library because the client
 * keeps its dependency list at Next + React and a syllabus only needs laid-out
 * text plus a logo.
 *
 * Coordinates are top-down like CSS (y grows downwards); they're flipped
 * into PDF's bottom-up space when the operators are emitted.
 */
import { deflateSync } from "node:zlib";
import type { RgbImage } from "@/lib/png";

export type FontName = "regular" | "bold";
/** Colour channels 0–1. */
export type RGB = readonly [number, number, number];

export type TextStyle = {
  font?: FontName;
  size?: number;
  color?: RGB;
  /** Baseline-to-baseline distance as a multiple of the font size. */
  lineHeight?: number;
};

const PAGE = { width: 595.28, height: 841.89 } as const;

/** Glyph advance widths (1/1000 em) for WinAnsi codes 32–126, from Adobe's AFM files. */
const WIDTHS: Record<FontName, number[]> = {
  regular: (
    "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 " +
    "1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556 " +
    "333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 278 556 500 722 500 500 500 334 260 334 584"
  )
    .split(" ")
    .map(Number),
  bold: (
    "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 " +
    "975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556 " +
    "333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389 556 333 611 556 778 556 556 500 389 280 389 584"
  )
    .split(" ")
    .map(Number),
};

/** Characters outside Latin-1 that WinAnsi does encode: code point → [byte, regular width, bold width]. */
const WIN_ANSI_EXTRA: Record<number, [number, number, number]> = {
  0x20ac: [0x80, 556, 556], // €
  0x2026: [0x85, 1000, 1000], // …
  0x2018: [0x91, 222, 278], // '
  0x2019: [0x92, 222, 278], // '
  0x201c: [0x93, 333, 500], // "
  0x201d: [0x94, 333, 500], // "
  0x2022: [0x95, 350, 350], // •
  0x2013: [0x96, 556, 556], // –
  0x2014: [0x97, 1000, 1000], // —
  0x2122: [0x99, 1000, 1000], // ™
};

/** Latin-1 symbols whose width differs from the letter fallback. */
const LATIN1_WIDTHS: Record<number, [number, number]> = {
  0xa0: [278, 278],
  0xa7: [556, 556], // §
  0xa9: [737, 737], // ©
  0xab: [556, 556], // «
  0xae: [737, 737], // ®
  0xb0: [400, 400], // °
  0xb1: [584, 584], // ±
  0xb7: [278, 278], // ·
  0xbb: [556, 556], // »
  0xbc: [834, 834],
  0xbd: [834, 834],
  0xbe: [834, 834],
  0xc6: [1000, 1000], // Æ
  0xd7: [584, 584], // ×
  0xd8: [778, 778], // Ø
  0xdf: [611, 611], // ß
  0xe6: [889, 889], // æ
  0xf7: [584, 584], // ÷
  0xf8: [611, 611], // ø
};

/** Substitutions for common characters WinAnsi cannot encode. */
const SUBSTITUTIONS: Record<string, string> = {
  "₹": "Rs. ",
  "→": "->",
  "←": "<-",
  "−": "-",
  "‐": "-",
  "‑": "-",
  "―": "—",
  "′": "'",
  "″": '"',
  "⁄": "/", // fraction slash, e.g. from NFKC("½")
  "✓": "-",
  "✔": "-",
  "●": "•",
  "▪": "•",
  "‣": "•",
  "⁃": "•",
};

function isEncodable(code: number): boolean {
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || code in WIN_ANSI_EXTRA;
}

/**
 * Reduces arbitrary text to what the standard fonts can show: known symbols
 * are substituted, accents are kept, and anything else (other scripts,
 * emoji) is dropped. Control characters and runs of whitespace collapse to
 * one space; use `paragraphs()` first to keep line breaks.
 */
export function sanitize(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFKC")) {
    const sub = SUBSTITUTIONS[ch];
    if (sub !== undefined) {
      out += sub;
      continue;
    }
    const code = ch.codePointAt(0)!;
    if (isEncodable(code)) out += ch;
    else if (/\s/.test(ch)) out += " ";
    else {
      // Try the base letter (e.g. "ő" → "o"); otherwise drop it.
      const base = ch.normalize("NFD")[0]!;
      if (base !== ch && isEncodable(base.codePointAt(0)!)) out += base;
    }
  }
  return (
    out
      .replace(/\s+/g, " ")
      // Dropped runs can leave punctuation stranded ("practice. . Next"): remove lone marks after sentence ends.
      .replace(/(?<=[.!?,;:]) [.!?,;:](?=\s|$)/g, "")
      .replace(/^[.!?,;:]\s+/, "")
      .trim()
  );
}

/** Splits admin-entered text on blank lines / line breaks into non-empty paragraphs. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => sanitize(line))
    .filter(Boolean);
}

function glyphWidth(ch: string, font: FontName): number {
  const code = ch.codePointAt(0)!;
  if (code >= 0x20 && code <= 0x7e) return WIDTHS[font][code - 0x20]!;
  const extra = WIN_ANSI_EXTRA[code];
  if (extra) return font === "bold" ? extra[2] : extra[1];
  const symbol = LATIN1_WIDTHS[code];
  if (symbol) return font === "bold" ? symbol[1] : symbol[0];
  // Accented letters share their base letter's advance width.
  const base = ch.normalize("NFD")[0]!.codePointAt(0)!;
  if (base >= 0x20 && base <= 0x7e) return WIDTHS[font][base - 0x20]!;
  return font === "bold" ? 611 : 556;
}

/** Width of `text` in points when set in `font` at `size`. */
export function widthOf(text: string, font: FontName, size: number): number {
  let total = 0;
  for (const ch of text) total += glyphWidth(ch, font);
  return (total * size) / 1000;
}

/** PDF string literal in WinAnsi, kept pure ASCII via octal escapes. */
function literal(text: string): string {
  let out = "(";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    const byte = code in WIN_ANSI_EXTRA ? WIN_ANSI_EXTRA[code]![0] : code;
    if (ch === "(" || ch === ")" || ch === "\\") out += `\\${ch}`;
    else if (byte < 0x20 || byte > 0x7e) out += `\\${byte.toString(8).padStart(3, "0")}`;
    else out += ch;
  }
  return out + ")";
}

const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ""));
const rgb = (c: RGB) => c.map(num).join(" ");

/** Greedy word wrap; words wider than the line are broken by character. */
export function wrap(text: string, font: FontName, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  const push = (word: string) => {
    const candidate = line ? `${line} ${word}` : word;
    if (widthOf(candidate, font, size) <= maxWidth) {
      line = candidate;
      return;
    }
    if (line) lines.push(line);
    line = "";
    if (widthOf(word, font, size) <= maxWidth) {
      line = word;
      return;
    }
    for (const ch of word) {
      if (widthOf(line + ch, font, size) > maxWidth && line) {
        lines.push(line);
        line = "";
      }
      line += ch;
    }
  };
  for (const word of text.split(" ")) if (word) push(word);
  if (line) lines.push(line);
  return lines;
}

export type Margins = { top: number; right: number; bottom: number; left: number };

export class PdfDocument {
  readonly width = PAGE.width;
  readonly height = PAGE.height;
  readonly margins: Margins;
  /** Current flow position from the top of the page. */
  y = 0;
  private readonly pages: string[][] = [];
  private readonly images: RgbImage[] = [];
  private current = -1;

  constructor(margins: Partial<Margins> = {}) {
    this.margins = { top: 56, right: 48, bottom: 64, left: 48, ...margins };
    this.addPage();
  }

  get pageCount(): number {
    return this.pages.length;
  }
  get pageIndex(): number {
    return this.current;
  }
  get left(): number {
    return this.margins.left;
  }
  get right(): number {
    return this.width - this.margins.right;
  }
  get contentWidth(): number {
    return this.right - this.left;
  }
  get bottom(): number {
    return this.height - this.margins.bottom;
  }

  addPage(): void {
    this.pages.push([]);
    this.current = this.pages.length - 1;
    this.y = this.margins.top;
  }

  /** Draws onto an existing page (used for footers once the page count is known). */
  usePage(index: number): void {
    this.current = index;
  }

  /** Starts a new page unless `height` more points fit above the bottom margin. */
  ensure(height: number): void {
    if (this.y + height > this.bottom) this.addPage();
  }

  space(points: number): void {
    this.y += points;
  }

  private op(s: string): void {
    this.pages[this.current]!.push(s);
  }

  rect(x: number, y: number, w: number, h: number, fill: RGB): void {
    this.op(`${rgb(fill)} rg ${num(x)} ${num(this.height - y - h)} ${num(w)} ${num(h)} re f`);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: RGB, width = 1): void {
    this.op(`${rgb(color)} RG ${num(width)} w ${num(x1)} ${num(this.height - y1)} m ${num(x2)} ${num(this.height - y2)} l S`);
  }

  /** Registers raw pixels once; the returned handle can be drawn on any page. */
  addImage(image: RgbImage): string {
    this.images.push(image);
    return `/Im${this.images.length}`;
  }

  /** Draws a registered image with its top-left corner at (x, y), scaled to w × h. */
  image(handle: string, x: number, y: number, w: number, h: number): void {
    this.op(`q ${num(w)} 0 0 ${num(h)} ${num(x)} ${num(this.height - y - h)} cm ${handle} Do Q`);
  }

  /** Places one line of text with its baseline at `y`; no wrapping or flow. */
  text(text: string, x: number, y: number, style: TextStyle = {}): void {
    const { font = "regular", size = 10, color = [0, 0, 0] } = style;
    this.op(
      `BT /${font === "bold" ? "F2" : "F1"} ${num(size)} Tf ${rgb(color)} rg 1 0 0 1 ${num(x)} ${num(this.height - y)} Tm ${literal(text)} Tj ET`,
    );
  }

  textRight(text: string, rightX: number, y: number, style: TextStyle = {}): void {
    this.text(text, rightX - widthOf(text, style.font ?? "regular", style.size ?? 10), y, style);
  }

  /**
   * Flows a wrapped paragraph from the cursor, breaking pages between lines.
   * Returns the number of lines set.
   */
  paragraph(text: string, style: TextStyle & { x?: number; width?: number; after?: number } = {}): number {
    const { font = "regular", size = 10, color = [0, 0, 0], lineHeight = 1.45, x = this.left, after = 0 } = style;
    const width = style.width ?? this.right - x;
    const step = size * lineHeight;
    const lines = wrap(text, font, size, width);
    for (const line of lines) {
      this.ensure(step);
      this.text(line, x, this.y + size, { font, size, color });
      this.y += step;
    }
    this.y += after;
    return lines.length;
  }

  /** Height a paragraph would take, for keep-together decisions. */
  measure(text: string, style: TextStyle & { width?: number } = {}): number {
    const { font = "regular", size = 10, lineHeight = 1.45 } = style;
    return wrap(text, font, size, style.width ?? this.contentWidth).length * size * lineHeight;
  }

  /** Renders the document; `decorate` runs once per page after the flow (page numbers, footers). */
  build(meta: { title: string; author?: string; subject?: string }, decorate?: (page: number, total: number) => void): Uint8Array<ArrayBuffer> {
    if (decorate) {
      const total = this.pages.length;
      for (let i = 0; i < total; i++) {
        this.usePage(i);
        decorate(i + 1, total);
      }
    }

    // Object bodies are text except image streams, which are raw bytes.
    type Body = (string | Uint8Array)[];
    const objects: Body[] = [];
    const add = (...body: Body) => objects.push(body); // returns the 1-based object number
    const stream = (dict: string, data: string | Uint8Array) => add(`${dict.slice(0, -2)} /Length ${data.length} >>\nstream\n`, data, "\nendstream");

    const catalog = add(); // patched once the page ids are known
    const pagesObj = add();
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const stamp = new Date().toISOString().replace(/[-:]|\.\d+/g, "").replace("T", "");
    const info = add(
      `<< /Title ${literal(sanitize(meta.title))}${meta.author ? ` /Author ${literal(sanitize(meta.author))}` : ""}${
        meta.subject ? ` /Subject ${literal(sanitize(meta.subject))}` : ""
      } /Producer (BIM Career Academy website) /CreationDate (D:${stamp}) >>`,
    );

    const xobjects = this.images.map((image, i) => {
      const size = `/Width ${image.width} /Height ${image.height} /BitsPerComponent 8 /Filter /FlateDecode`;
      const mask = image.alpha ? stream(`<< /Type /XObject /Subtype /Image ${size} /ColorSpace /DeviceGray >>`, deflateSync(image.alpha)) : null;
      const id = stream(
        `<< /Type /XObject /Subtype /Image ${size} /ColorSpace /DeviceRGB${mask ? ` /SMask ${mask} 0 R` : ""} >>`,
        deflateSync(image.rgb),
      );
      return `/Im${i + 1} ${id} 0 R`;
    });
    const resources = `/Resources << /Font << /F1 3 0 R /F2 4 0 R >>${xobjects.length ? ` /XObject << ${xobjects.join(" ")} >>` : ""} >>`;

    const pageIds: number[] = [];
    for (const ops of this.pages) {
      // Content streams are pure ASCII (non-ASCII bytes are octal-escaped), so string length is byte length.
      const contents = stream("<< >>", ops.join("\n"));
      pageIds.push(add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${num(this.width)} ${num(this.height)}] ${resources} /Contents ${contents} 0 R >>`));
    }
    objects[catalog - 1] = [`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`];
    objects[pagesObj - 1] = [`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`];

    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];
    let length = 0;
    const push = (part: string | Uint8Array) => {
      const bytes = typeof part === "string" ? encoder.encode(part) : part;
      parts.push(bytes);
      length += bytes.length;
    };
    push("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"); // binary marker comment, as the spec recommends for files with image data
    const offsets: number[] = [];
    objects.forEach((body, i) => {
      offsets.push(length);
      push(`${i + 1} 0 obj\n`);
      for (const part of body) push(part);
      push("\nendobj\n");
    });
    const xref = length;
    push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
    for (const offset of offsets) push(`${String(offset).padStart(10, "0")} 00000 n \n`);
    push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

    const out = new Uint8Array(length);
    let at = 0;
    for (const part of parts) {
      out.set(part, at);
      at += part.length;
    }
    return out;
  }
}
