/**
 * One-off helper: copies every file under UPLOAD_DIR into the `upload_files`
 * table so existing disk uploads survive a move to `UPLOAD_STORAGE=db`.
 * Safe to re-run — files already in the table are skipped.
 *
 *   npm run uploads:import
 */
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";
import { closeDatabase } from "../config/database";
import { uploadFileRepository } from "../repositories/upload-file.repository";
import { allowedUploadTypes } from "../services/media.service";

const mimeByExt: Record<string, string> = { ".jpeg": "image/jpeg" };
for (const [mime, ext] of Object.entries(allowedUploadTypes)) mimeByExt[ext] = mime;

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && !entry.name.startsWith(".")) files.push(full);
  }
  return files;
}

async function main() {
  const files = await walk(env.uploadDir);
  let imported = 0;
  let skipped = 0;
  for (const file of files) {
    const relPath = path.relative(env.uploadDir, file).split(path.sep).join("/");
    const mimeType = mimeByExt[path.extname(file).toLowerCase()];
    if (!mimeType) {
      console.log(`[uploads] skip ${relPath} (not an image type we serve)`);
      skipped += 1;
      continue;
    }
    const content = await fs.readFile(file);
    const inserted = await uploadFileRepository.create({ path: relPath, mimeType, sizeBytes: content.length, content });
    if (inserted) {
      imported += 1;
      console.log(`[uploads] imported ${relPath} (${content.length} bytes)`);
    } else {
      skipped += 1;
    }
  }
  console.log(`[uploads] done: ${imported} imported, ${skipped} skipped, ${files.length} scanned`);
}

main()
  .catch((err) => {
    console.error("[uploads] failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
