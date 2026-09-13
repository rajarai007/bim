import type { DonutSlice, Tone } from "@/types";
import { cn } from "@/lib/utils";

const strokeTone: Record<Tone, string> = {
  primary: "text-primary",
  teal: "text-teal",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-muted",
};

const swatchTone: Record<Tone, string> = {
  primary: "bg-primary",
  teal: "bg-teal",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  danger: "bg-danger",
  muted: "bg-muted",
};

/** 110px ring (16.5px thick) with segments drawn clockwise from 12 o'clock, plus a legend. */
export function DonutChart({ slices, total }: { slices: DonutSlice[]; total: string }) {
  const size = 110;
  const stroke = 16.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Pre-compute each segment's start offset so rendering stays pure.
  const segments = slices.reduce<{ slice: DonutSlice; len: number; offset: number }[]>((acc, slice) => {
    const len = (slice.percent / 100) * c;
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0;
    return [...acc, { slice, len, offset }];
  }, []);

  return (
    <div className="flex h-[190px] w-full items-center gap-6">
      <div className="relative flex size-[120px] shrink-0 items-center justify-center">
        <svg
          role="img"
          aria-label={`Enquiries by category, ${total} total`}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-track" />
          {segments.map(({ slice, len, offset }) => (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              className={strokeTone[slice.tone]}
            />
          ))}
        </svg>
        <span className="absolute font-heading text-16 font-extrabold leading-native text-ink">{total}</span>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
        {slices.map((s) => (
          <li key={s.label} className="flex w-full items-center gap-2">
            <span aria-hidden className={cn("size-3 shrink-0 rounded-[3px]", swatchTone[s.tone])} />
            <span className="min-w-0 flex-1 truncate font-sans text-12 leading-native text-body">{s.label}</span>
            <span className="font-sans text-12 font-bold leading-native text-ink whitespace-nowrap">{s.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
