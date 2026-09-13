"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { uploadMedia } from "@/features/media/actions";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Upload control that stores the resulting media URL in a hidden input so the
 * surrounding form can submit it. Shows the current image with a remove action.
 */
export function ImagePicker({
  name,
  value,
  onChange,
  label = "Click to upload image",
  hint = "PNG, JPG, WEBP or SVG up to 5MB",
  shape = "wide",
}: {
  name: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  shape?: "wide" | "square";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const result = await uploadMedia(fd);
      if (result.ok && result.media) onChange(result.media.url);
      else setError(result.error ?? "Upload failed.");
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <input type="hidden" name={name} value={value ?? ""} />
      {value ? (
        <div className={cn("relative w-full overflow-hidden rounded-md border border-line bg-page", shape === "square" ? "aspect-square max-w-[200px]" : "aspect-video")}>
          <Image src={mediaUrl(value)} alt="" fill sizes="(min-width: 1280px) 380px, 100vw" loading="eager" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-sm bg-card/90 text-danger shadow-card transition-colors hover:bg-card"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
      <label
        className={cn(
          "flex w-full cursor-pointer flex-col items-center gap-3 rounded-md border border-dashed border-line bg-page p-8 text-center transition-colors hover:border-primary",
          pending && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <ImageUp className="size-10 text-primary" strokeWidth={1.5} aria-hidden />
        <span className="flex flex-col items-center gap-1 leading-native">
          <span className="font-sans text-13 font-bold text-primary">{pending ? "Uploading…" : value ? "Replace image" : label}</span>
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
