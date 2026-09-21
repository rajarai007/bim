"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FormStatus } from "@/components/ui/form-status";
import { deleteMedia, uploadMedia } from "@/features/media/actions";
import { formatBytes } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import type { MediaItem } from "@/types";
import { cn } from "@/lib/utils";

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ message?: string; error?: string }>({});

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    startTransition(async () => {
      let uploaded = 0;
      let error: string | undefined;
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadMedia(fd);
        if (result.ok) uploaded += 1;
        else error = result.error;
      }
      setNotice(error ? { error: `${uploaded ? `${uploaded} uploaded. ` : ""}${error}` } : { message: `${uploaded} file${uploaded === 1 ? "" : "s"} uploaded.` });
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const remove = (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.fileName}"?`)) return;
    startTransition(async () => {
      const result = await deleteMedia(item.id);
      setNotice(result?.error ? { error: result.error } : { message: result?.message });
    });
  };

  return (
    <>
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle size="lg">Media Library</CardTitle>
          <p className="font-sans text-12 leading-native text-muted">
            {items.length} files · images for course cards, projects, trainers and page banners, plus PDF syllabus downloads.
          </p>
          <FormStatus message={notice.message} error={notice.error} />
        </div>
        <label className={cn("shrink-0", pending && "pointer-events-none opacity-60")}>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
          <Button type="button" className="pointer-events-none">
            <Upload className="size-4" aria-hidden />
            {pending ? "Uploading…" : "Upload Files"}
          </Button>
        </label>
      </Card>
      {items.length ? (
        <ul className={cn("grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6", pending && "opacity-70")}>
          {items.map((m, index) => (
            <li key={m.id}>
              <Card className="group relative flex h-full flex-col overflow-hidden">
                {m.mimeType === "application/pdf" ? (
                  <a
                    href={mediaUrl(m.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${m.fileName}`}
                    className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-page text-primary transition-colors hover:bg-primary-tint"
                  >
                    <FileText className="size-10" strokeWidth={1.5} aria-hidden />
                    <span className="font-sans text-11 font-bold uppercase leading-native">PDF</span>
                  </a>
                ) : (
                  <span className="relative block aspect-[4/3] w-full bg-page">
                    <Image
                      src={mediaUrl(m.url)}
                      alt={m.fileName}
                      fill
                      sizes="(min-width: 1280px) 180px, 33vw"
                      // The first row is above the fold (and the LCP); the rest can load lazily.
                      loading={index < 6 ? "eager" : "lazy"}
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="flex flex-col gap-1 p-3 leading-native">
                  <span className="truncate font-sans text-12 font-bold text-ink" title={m.fileName}>{m.fileName}</span>
                  <span className="font-sans text-11 text-muted">
                    {formatBytes(m.sizeBytes)} · used {m.usageCount}×
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(m)}
                  disabled={pending || m.usageCount > 0}
                  title={m.usageCount > 0 ? "In use — cannot delete" : "Delete file"}
                  aria-label={`Delete ${m.fileName}`}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-xs bg-card/90 text-danger opacity-0 shadow-card transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:text-muted"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-12 text-center font-sans text-14 text-muted">No files uploaded yet.</Card>
      )}
    </>
  );
}
