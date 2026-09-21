/**
 * Just enough PNG decoding to place a logo in a generated PDF: 8-bit,
 * non-interlaced greyscale / RGB / palette images with optional alpha,
 * decompressed with Node's zlib and unfiltered into raw pixel rows.
 */
import { inflateSync } from "node:zlib";

/** Raw 8-bit pixels: `rgb` is width × height × 3, `alpha` (if present) width × height. */
export type RgbImage = { width: number; height: number; rgb: Uint8Array; alpha?: Uint8Array };

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

export function decodePng(bytes: Uint8Array): RgbImage {
  if (bytes.length < 8 || SIGNATURE.some((b, i) => bytes[i] !== b)) throw new Error("Not a PNG file");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let palette: Uint8Array | undefined;
  const idat: Uint8Array[] = [];
  for (let pos = 8; pos + 8 <= bytes.length; ) {
    const length = view.getUint32(pos);
    const type = String.fromCharCode(bytes[pos + 4]!, bytes[pos + 5]!, bytes[pos + 6]!, bytes[pos + 7]!);
    const data = bytes.subarray(pos + 8, pos + 8 + length);
    if (type === "IHDR") {
      width = view.getUint32(pos + 8);
      height = view.getUint32(pos + 12);
      bitDepth = bytes[pos + 16]!;
      colorType = bytes[pos + 17]!;
      interlace = bytes[pos + 20]!;
    } else if (type === "PLTE") palette = data;
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + length;
  }

  const channels = CHANNELS[colorType];
  if (!width || !height || !channels) throw new Error("Unsupported PNG colour type");
  if (bitDepth !== 8 || interlace !== 0) throw new Error("Only 8-bit non-interlaced PNGs are supported");
  if (colorType === 3 && !palette) throw new Error("Palette PNG without a PLTE chunk");

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  if (raw.length < height * (stride + 1)) throw new Error("Truncated PNG image data");

  const hasAlpha = colorType === 4 || colorType === 6;
  const rgb = new Uint8Array(width * height * 3);
  const alpha = hasAlpha ? new Uint8Array(width * height) : undefined;
  let prev = new Uint8Array(stride);
  let cur = new Uint8Array(stride);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    const filter = raw[rowStart]!;
    for (let i = 0; i < stride; i++) {
      const x = raw[rowStart + 1 + i]!;
      const a = i >= channels ? cur[i - channels]! : 0;
      const b = prev[i]!;
      const c = i >= channels ? prev[i - channels]! : 0;
      let value: number;
      switch (filter) {
        case 0:
          value = x;
          break;
        case 1:
          value = x + a;
          break;
        case 2:
          value = x + b;
          break;
        case 3:
          value = x + ((a + b) >> 1);
          break;
        case 4:
          value = x + paeth(a, b, c);
          break;
        default:
          throw new Error(`Unknown PNG filter ${filter}`);
      }
      cur[i] = value & 0xff;
    }

    for (let x = 0; x < width; x++) {
      const px = y * width + x;
      const s = x * channels;
      switch (colorType) {
        case 0:
        case 4:
          rgb[px * 3] = rgb[px * 3 + 1] = rgb[px * 3 + 2] = cur[s]!;
          break;
        case 3: {
          const idx = cur[s]! * 3;
          rgb[px * 3] = palette![idx] ?? 0;
          rgb[px * 3 + 1] = palette![idx + 1] ?? 0;
          rgb[px * 3 + 2] = palette![idx + 2] ?? 0;
          break;
        }
        default:
          rgb[px * 3] = cur[s]!;
          rgb[px * 3 + 1] = cur[s + 1]!;
          rgb[px * 3 + 2] = cur[s + 2]!;
      }
      if (alpha) alpha[px] = cur[s + channels - 1]!;
    }
    [prev, cur] = [cur, prev];
  }

  return { width, height, rgb, alpha };
}

/**
 * Box-filter downscale so the longest side is at most `maxSize` pixels.
 * Colour is averaged premultiplied by alpha, which keeps transparent edges
 * from picking up dark fringes.
 */
export function downscale(image: RgbImage, maxSize: number): RgbImage {
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  if (scale === 1) return image;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const rgb = new Uint8Array(width * height * 3);
  const alpha = image.alpha ? new Uint8Array(width * height) : undefined;

  for (let dy = 0; dy < height; dy++) {
    const y0 = Math.floor((dy * image.height) / height);
    const y1 = Math.max(y0 + 1, Math.floor(((dy + 1) * image.height) / height));
    for (let dx = 0; dx < width; dx++) {
      const x0 = Math.floor((dx * image.width) / width);
      const x1 = Math.max(x0 + 1, Math.floor(((dx + 1) * image.width) / width));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const px = y * image.width + x;
          const weight = image.alpha ? image.alpha[px]! : 255;
          r += image.rgb[px * 3]! * weight;
          g += image.rgb[px * 3 + 1]! * weight;
          b += image.rgb[px * 3 + 2]! * weight;
          a += weight;
          n++;
        }
      }
      const out = dy * width + dx;
      if (a > 0) {
        rgb[out * 3] = Math.round(r / a);
        rgb[out * 3 + 1] = Math.round(g / a);
        rgb[out * 3 + 2] = Math.round(b / a);
      }
      if (alpha) alpha[out] = Math.round(a / n);
    }
  }
  return { width, height, rgb, alpha };
}
