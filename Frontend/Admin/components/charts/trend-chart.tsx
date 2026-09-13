import type { TrendPoint } from "@/types";

/**
 * Line chart with 5 horizontal grid lines and category labels beneath.
 * Scales to its container width via the SVG viewBox.
 */
export function TrendChart({ points, height = 160 }: { points: TrendPoint[]; height?: number }) {
  const width = 540;
  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const path = points
    .map((p, i) => `${(i * step).toFixed(1)},${((1 - (p.value - min) / range) * height).toFixed(1)}`)
    .join(" ");

  return (
    <div className="flex w-full flex-col gap-4">
      <svg
        role="img"
        aria-label="Daily enquiries for the last 7 days"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-[160px] w-full overflow-visible"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const y = (i * height) / 4;
          return (
            <line
              key={i}
              x1={0}
              x2={width}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 4"
              className="text-line"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        <polyline
          points={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          className="text-primary"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ol className="flex w-full items-start justify-between font-sans text-11 leading-native text-muted">
        {points.map((p) => (
          <li key={p.label}>{p.label}</li>
        ))}
      </ol>
    </div>
  );
}
