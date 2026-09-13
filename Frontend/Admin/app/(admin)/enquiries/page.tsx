import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadTable } from "@/components/enquiries/lead-table";
import { AdminPage } from "@/components/layout/page";
import { getLeadStats, listCourseTitles, listLeads } from "@/features/enquiries/service";
import type { LeadStatus } from "@/types";

export const metadata: Metadata = { title: "Enquiry & Lead Management" };

const statuses: LeadStatus[] = ["new", "contacted", "follow-up", "converted", "lost"];

export default async function EnquiriesPage({ searchParams }: PageProps<"/enquiries">) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const status = first(params.status);
  const days = Number(first(params.days));
  const [{ items, pagination }, stats, courseTitles] = await Promise.all([
    listLeads({
      page: Math.max(1, Number(first(params.page)) || 1),
      pageSize: 10,
      q: first(params.q),
      status: statuses.includes(status as LeadStatus) ? (status as LeadStatus) : "all",
      course: first(params.course),
      days: Number.isFinite(days) && days > 0 ? days : undefined,
    }),
    getLeadStats(),
    listCourseTitles(),
  ]);
  return (
    <AdminPage title="Enquiry & Lead Management">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} compact />
        ))}
      </div>
      <LeadTable leads={items} pagination={pagination} courseTitles={courseTitles} />
    </AdminPage>
  );
}
