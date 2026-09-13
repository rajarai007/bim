import { adminFetch } from "@/lib/api";
import { formatCompact, formatNumber } from "@/lib/format";
import type { DashboardData, Lead, StatCard, Tone } from "@/types";

type ApiDashboard = {
  stats: { id: string; label: string; value: number; delta: { label: string; tone: "success" | "primary" }; trend: number[] }[];
  trend: { label: string; date: string; value: number }[];
  byCategory: { label: string; count: number; percent: number; tone: Tone }[];
  byCategoryTotal: number;
  recentEnquiries: Lead[];
};

const dots: Record<string, Tone> = {
  "total-courses": "primary",
  "active-courses": "teal",
  "total-enquiries": "success",
  "new-enquiries": "info",
};

export async function getDashboard(): Promise<DashboardData> {
  const data = await adminFetch<ApiDashboard>("/admin/dashboard");
  const stats: StatCard[] = data.stats.map((s) => ({
    id: s.id,
    label: s.label,
    value: formatNumber(s.value),
    delta: s.delta,
    dot: dots[s.id] ?? "primary",
    trend: s.trend,
  }));
  return {
    stats,
    trend: data.trend.map((t) => ({ label: t.label, value: t.value })),
    byCategory: data.byCategory.map((c) => ({ label: c.label, percent: c.percent, tone: c.tone })),
    byCategoryTotal: formatCompact(data.byCategoryTotal),
    recentEnquiries: data.recentEnquiries,
  };
}
