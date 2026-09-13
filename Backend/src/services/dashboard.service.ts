import { categoryRepository } from "../repositories/category.repository";
import { courseRepository } from "../repositories/course.repository";
import { enquiryRepository } from "../repositories/enquiry.repository";
import { adminEnquiry } from "./serializers";

export type StatDelta = { label: string; tone: "success" | "primary" };

export type DashboardStat = {
  id: string;
  label: string;
  value: number;
  delta: StatDelta;
  /** Normalised 0..1 series for the sparkline (oldest → newest). */
  trend: number[];
};

const DAY = 86_400_000;

function normalise(series: number[]): number[] {
  const max = Math.max(...series, 0);
  const min = Math.min(...series, max);
  const range = max - min || 1;
  return series.map((v) => Number(((v - min) / range).toFixed(3)));
}

function percentDelta(current: number, previous: number): StatDelta {
  if (previous === 0) {
    return current > 0 ? { label: `+${current} new`, tone: "success" } : { label: "Stable", tone: "success" };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { label: "Stable", tone: "success" };
  return { label: `${pct > 0 ? "+" : ""}${pct}%`, tone: pct >= 0 ? "success" : "primary" };
}

export const dashboardService = {
  async get() {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * DAY);
    const twoMonthsAgo = new Date(now.getTime() - 60 * DAY);

    const [courseCounts, newCoursesThisMonth, courseTrend, enquiryStats, enqThisMonth, enqLastMonth, newThisMonth, newLastMonth, daily, byCategoryRaw, categories, recent] =
      await Promise.all([
        courseRepository.countByStatus(),
        courseRepository.countCreatedSince(monthAgo),
        courseRepository.cumulativeCounts(7),
        enquiryRepository.stats(),
        enquiryRepository.countBetween(monthAgo, now),
        enquiryRepository.countBetween(twoMonthsAgo, monthAgo),
        enquiryRepository.countBetween(monthAgo, now, "new"),
        enquiryRepository.countBetween(twoMonthsAgo, monthAgo, "new"),
        enquiryRepository.dailyCounts(7),
        enquiryRepository.countByCategory(),
        categoryRepository.findAll(),
        enquiryRepository.findRecent(6),
      ]);

    const dailyCounts = daily.map((d) => d.count);
    const totalByCategory = byCategoryRaw.reduce((sum, c) => sum + c.count, 0);
    const tones = ["primary", "teal", "info", "warning", "success", "danger", "muted"] as const;
    const byCategory = byCategoryRaw.map((c, i) => ({
      label: c.name,
      count: c.count,
      percent: totalByCategory ? Math.round((c.count / totalByCategory) * 100) : 0,
      tone: tones[Math.min(i, tones.length - 1)]!,
    }));
    // Make sure every active category is represented even with zero leads.
    for (const cat of categories) {
      if (!byCategory.some((b) => b.label === cat.name)) {
        byCategory.push({ label: cat.name, count: 0, percent: 0, tone: tones[Math.min(byCategory.length, tones.length - 1)]! });
      }
    }

    const stats: DashboardStat[] = [
      {
        id: "total-courses",
        label: "Total Courses",
        value: courseCounts.total,
        delta: newCoursesThisMonth > 0 ? { label: `+${newCoursesThisMonth} new`, tone: "success" } : { label: "Stable", tone: "success" },
        trend: normalise(courseTrend),
      },
      {
        id: "active-courses",
        label: "Active Courses",
        value: courseCounts.active,
        delta: { label: "Stable", tone: "success" },
        trend: normalise(courseTrend),
      },
      {
        id: "total-enquiries",
        label: "Total Enquiries",
        value: enquiryStats.total,
        delta: percentDelta(enqThisMonth, enqLastMonth),
        trend: normalise(dailyCounts),
      },
      {
        id: "new-enquiries",
        label: "New Enquiries",
        value: enquiryStats.new,
        delta: percentDelta(newThisMonth, newLastMonth),
        trend: normalise(dailyCounts),
      },
    ];

    const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });

    return {
      stats,
      trend: daily.map((d) => ({ label: weekday(d.day), date: d.day, value: d.count })),
      byCategory,
      byCategoryTotal: totalByCategory,
      recentEnquiries: recent.map(adminEnquiry),
    };
  },
};
