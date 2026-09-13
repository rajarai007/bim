import { adminFetch } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { AdminCourse, Lead, LeadStats, LeadStatus, Paginated, StatCard } from "@/types";

export type LeadListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: LeadStatus | "all";
  course?: string;
  days?: number;
};

export async function listLeads(params: LeadListParams = {}): Promise<Paginated<Lead>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 10));
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.course && params.course !== "all") qs.set("course", params.course);
  if (params.days) qs.set("days", String(params.days));
  return adminFetch<Paginated<Lead>>(`/admin/enquiries?${qs.toString()}`);
}

export async function getLeadStats(): Promise<StatCard[]> {
  const s = await adminFetch<LeadStats>("/admin/enquiries/stats");
  return [
    { id: "total", label: "Total Enquiries", value: formatNumber(s.total), caption: "Cumulative leads received", dot: "primary" },
    { id: "new", label: "New Enquiries", value: formatNumber(s.new), caption: "Awaiting response", dot: "info" },
    { id: "progress", label: "In Progress", value: formatNumber(s.inProgress), caption: "Currently contacted/followup", dot: "warning" },
    { id: "converted", label: "Converted", value: formatNumber(s.converted), caption: "Successfully enrolled students", dot: "success" },
  ];
}

/** Course titles for the "filter by course" select. */
export async function listCourseTitles(): Promise<string[]> {
  const { items } = await adminFetch<Paginated<AdminCourse>>("/admin/courses?pageSize=100");
  return items.map((c) => c.title);
}
