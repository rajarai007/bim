import type { Metadata } from "next";
import { DonutChart } from "@/components/charts/donut-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { RecentEnquiries } from "@/components/dashboard/recent-enquiries";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminPage } from "@/components/layout/page";
import { Card, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/features/dashboard/service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await getDashboard();
  return (
    <AdminPage title="Dashboard">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex w-full items-center justify-between gap-4">
            <CardTitle size="sm">Enquiry Trends (Last 7 Days)</CardTitle>
            <span className="flex items-center gap-2 font-sans text-12 leading-native text-body whitespace-nowrap">
              <span aria-hidden className="size-1.5 rounded-pill bg-primary" />
              Daily Enquiries
            </span>
          </div>
          <TrendChart points={data.trend} />
        </Card>
        <Card className="flex flex-col gap-4 p-6">
          <CardTitle size="sm">Enquiries by Category</CardTitle>
          <DonutChart slices={data.byCategory} total={data.byCategoryTotal} />
        </Card>
      </div>

      <RecentEnquiries leads={data.recentEnquiries} />
    </AdminPage>
  );
}
