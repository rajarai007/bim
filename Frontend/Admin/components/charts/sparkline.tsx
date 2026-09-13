/** Tiny 80×36 polyline; `values` are normalised 0..1 (1 = top). */
export function Sparkline({
  values,
  tone = "success",
  width = 80,
  height = 36,
}: {
  values: number[];
  tone?: "success" | "primary";
  width?: number;
  height?: number;
}) {
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${((1 - v) * height).toFixed(1)}`).join(" ");
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={tone === "success" ? "text-success" : "text-primary"}
    >
      <polyline points={points} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
