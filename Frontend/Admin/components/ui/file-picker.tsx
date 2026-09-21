"use client";

import { useRef, useState, useTransition } from "react";
import { ExternalLink, FileText, FileUp, Trash2 } from "lucide-react";
import { uploadMedia } from "@/features/media/actions";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Last path segment of a media URL, shown when the original file name is unknown (existing records). */
const baseName = (url: string) => decodeURIComponent(url.split("/").pop() ?? url);

/**
 * Document upload control (PDF by default). Like `ImagePicker`, it uploads
 * through the media library and stores the resulting URL in a hidden input so
 * the surrounding form submits it; the current file is shown with open/remove actions.
 */
export function FilePicker({
  name,
  value,
  onChange,
  label = "Click to upload PDF",
  hint = "PDF up to 5MB",
  accept = "application/pdf",
}: {
  name: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Original name of a file uploaded in this session; existing records only carry the URL.
  const [fileName, setFileName] = useState<string | null>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const result = await uploadMedia(fd);
      if (result.ok && result.media) {
        setFileName(result.media.fileName);
        onChange(result.media.url);
      } else {
        setError(result.error ?? "Upload failed.");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const remove = () => {
    setFileName(null);
    onChange(null);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <input type="hidden" name={name} value={value ?? ""} />
      {value ? (
        <div className="flex w-full items-center gap-3 rounded-md border border-line bg-page px-4 py-3">
          <FileText className="size-6 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
          <span className="min-w-0 flex-1 truncate font-sans text-13 font-semibold leading-native text-ink" title={fileName ?? baseName(value)}>
            {fileName ?? baseName(value)}
          </span>
          <a
            href={mediaUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open file"
            className="flex size-8 shrink-0 items-center justify-center rounded-sm text-body transition-colors hover:bg-primary-tint hover:text-primary"
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={remove}
            aria-label="Remove file"
            className="flex size-8 shrink-0 items-center justify-center rounded-sm text-danger transition-colors hover:bg-danger-tint"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
      <label
        className={cn(
          "flex w-full cursor-pointer flex-col items-center gap-3 rounded-md border border-dashed border-line bg-page p-6 text-center transition-colors hover:border-primary",
          pending && "pointer-events-none opacity-60",
        )}
      >
        <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        <FileUp className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
        <span className="flex flex-col items-center gap-1 leading-native">
          <span className="font-sans text-13 font-bold text-primary">{pending ? "Uploading…" : value ? "Replace file" : label}</span>
          <span className="font-sans text-11 text-muted">{hint}</span>
        </span>
      </label>
      {error ? (
        <p role="alert" className="font-sans text-12 leading-native text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
