import { Sparkline } from "@/components/charts/sparkline";
import { Card } from "@/components/ui/card";
import { Dot } from "@/components/ui/status-badge";
import type { StatCard as StatCardData } from "@/types";
import { cn } from "@/lib/utils";

/** Dashboard KPI card (with sparkline) or the compact lead-stat variant (with caption). */
export function StatCard({ stat, compact = false }: { stat: StatCardData; compact?: boolean }) {
  return (
    <Card shadow={!compact} className={cn("flex flex-col items-start", compact ? "gap-3 p-5" : "gap-4 p-6")}>
      <div className="flex w-full items-center justify-between">
        <span className={cn("font-sans font-bold uppercase leading-native text-body", compact ? "text-12" : "text-13")}>
          {stat.label}
        </span>
        <Dot tone={stat.dot} />
      </div>
      <div className="flex w-full items-end justify-between gap-3">
        <div className="flex flex-col items-start gap-1 leading-native whitespace-nowrap">
          <span className={cn("font-heading font-extrabold text-ink", compact ? "text-28" : "text-32")}>
            {stat.value}
          </span>
          {stat.delta ? (
            <span className="flex items-center gap-1">
              <span className={cn("font-sans text-12 font-bold", stat.delta.tone === "success" ? "text-success" : "text-primary")}>
                {stat.delta.label}
              </span>
              <span className="font-sans text-11 text-muted">vs last month</span>
            </span>
          ) : stat.caption ? (
            <span className="font-sans text-11 text-muted">{stat.caption}</span>
          ) : null}
        </div>
        {stat.trend ? <Sparkline values={stat.trend} tone={stat.delta?.tone ?? "success"} /> : null}
      </div>
    </Card>
  );
}
