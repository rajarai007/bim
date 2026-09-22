"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormStatus } from "@/components/ui/form-status";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge, leadStatusMeta } from "@/components/ui/status-badge";
import { useDebouncedParam, useUrlFilters } from "@/components/ui/use-url-filters";
import { addLeadNote, updateLeadStatus } from "@/features/enquiries/actions";
import { formatReceivedAt, formatShortDate } from "@/lib/format";
import type { Lead, LeadStatus, Pagination as PaginationData } from "@/types";
import { cn } from "@/lib/utils";

const sourceLabels: Record<Lead["source"], string> = {
  contact_form: "Contact form",
  course_page: "Course page form",
  syllabus_download: "Syllabus download",
};

/* Column template shared by header and rows (matches Figma widths). */
const gridCols =
  "grid grid-cols-[60px_160px_130px_180px_minmax(0,1fr)_130px_110px_80px] items-center gap-4 px-4";

const selectClass =
  "w-full appearance-none rounded-sm border border-line bg-page px-4 py-2.5 pr-10 font-sans text-14 leading-native text-ink focus-visible:outline-none";

function ControlSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative flex min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 14 14"
        className="pointer-events-none absolute top-1/2 right-4 size-3.5 -translate-y-1/2 text-body"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 5.25 7 8.75l3.5-3.5" />
      </svg>
    </label>
  );
}

export function LeadTable({
  leads,
  pagination,
  courseTitles,
}: {
  leads: Lead[];
  pagination: PaginationData;
  courseTitles: string[];
}) {
  const { get, set } = useUrlFilters();
  const [query, setQuery] = useDebouncedParam("q");
  const [rows, setRows] = useState(leads);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ message?: string; error?: string }>({});

  // Re-sync local rows whenever the server sends a new page.
  const [lastLeads, setLastLeads] = useState(leads);
  if (leads !== lastLeads) {
    setLastLeads(leads);
    setRows(leads);
  }

  const applyLead = (lead: Lead) => setRows((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));

  const setStatus = (id: number, status: LeadStatus) =>
    startTransition(async () => {
      const result = await updateLeadStatus(id, status);
      if (result?.lead) applyLead(result.lead);
      setNotice(result?.error ? { error: result.error } : { message: `Lead #${id} marked ${leadStatusMeta[status].label.toLowerCase()}.` });
    });

  const saveNote = (id: number) => {
    const text = note.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await addLeadNote(id, text);
      if (result?.lead) {
        applyLead(result.lead);
        setNote("");
      }
      setNotice(result?.error ? { error: result.error } : { message: "Note saved." });
    });
  };

  // Export honours the current filters via a same-origin route that proxies the CSV.
  const exportParams = new URLSearchParams();
  for (const key of ["q", "status", "course", "days"]) {
    const v = get(key);
    if (v) exportParams.set(key, v);
  }
  const exportHref = `/enquiries/export${exportParams.toString() ? `?${exportParams}` : ""}`;
  const hasFilters = Boolean(get("q") || get("status") || get("course") || get("days"));

  return (
    <>
      <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <SearchInput
            placeholder="Search name or email..."
            aria-label="Search leads"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-[280px] md:shrink-0"
          />
          <ControlSelect label="Filter by course" value={get("course", "all")} onChange={(v) => set({ course: v })}>
            <option value="all">All BIM Courses</option>
            {courseTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </ControlSelect>
          <ControlSelect label="Filter by status" value={get("status", "all")} onChange={(v) => set({ status: v })}>
            <option value="all">Filter Status: All</option>
            {(Object.keys(leadStatusMeta) as LeadStatus[]).map((s) => (
              <option key={s} value={s}>
                {leadStatusMeta[s].label}
              </option>
            ))}
          </ControlSelect>
          <ControlSelect label="Date range" value={get("days", "all")} onChange={(v) => set({ days: v })}>
            <option value="all">Date: All Time</option>
            <option value="7">Date: Last 7 Days</option>
            <option value="30">Date: Last 30 Days</option>
            <option value="90">Date: Last 90 Days</option>
          </ControlSelect>
        </div>
        <Button href={exportHref} variant="outline" size="sm" className="shrink-0 py-2.5 text-14" prefetch={false}>
          <Download className="size-4" aria-hidden />
          Export Leads
        </Button>
      </Card>

      <Card className={cn("flex flex-col p-6 transition-opacity", pending && "opacity-70")}>
        <FormStatus message={notice.message} error={notice.error} className="pb-3" />
        <div className="w-full overflow-x-auto">
          <div role="table" aria-label="Leads" className="min-w-[1080px]">
            <div role="row" className={cn(gridCols, "border-b border-line bg-page py-3 font-sans text-12 font-bold leading-native text-body")}>
              <span role="columnheader">ID</span>
              <span role="columnheader">Lead Name</span>
              <span role="columnheader">Phone</span>
              <span role="columnheader">Email</span>
              <span role="columnheader">Requested Course</span>
              <span role="columnheader">Date Received</span>
              <span role="columnheader">Status</span>
              <span role="columnheader" className="text-right">Actions</span>
            </div>

            {rows.map((lead) => {
              const meta = leadStatusMeta[lead.status];
              const open = expanded === lead.id;
              const panelId = `lead-${lead.id}-details`;
              const row = (
                <div
                  role="row"
                  className={cn(gridCols, "py-3.5 font-sans leading-native", !open && "border-b border-line")}
                >
                  <span role="cell" className={cn("text-13", open ? "font-bold text-primary" : "text-muted")}>
                    #{lead.id}
                  </span>
                  <span role="cell" className={cn("truncate text-14 text-ink", open ? "font-bold" : "font-semibold")}>
                    {lead.fullName}
                  </span>
                  <span role="cell" className="text-13 text-body whitespace-nowrap">{lead.mobile}</span>
                  <span role="cell" className="truncate text-13 text-body">{lead.email ?? "—"}</span>
                  <span role="cell" className={cn("truncate text-14 text-ink", open && "font-bold")}>{lead.courseName ?? "General enquiry"}</span>
                  <span role="cell" className="text-13 text-muted whitespace-nowrap">{formatReceivedAt(lead.createdAt)}</span>
                  <span role="cell">
                    <StatusBadge tone={meta.tone} size="sm">
                      {lead.status === "follow-up" && open ? "In Follow-up" : meta.label}
                    </StatusBadge>
                  </span>
                  <span role="cell" className="text-right">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => {
                        setExpanded(open ? null : lead.id);
                        setNote("");
                      }}
                      className="font-sans text-13 font-bold leading-native text-primary transition-colors hover:text-[#ff6b36]"
                    >
                      {open ? "Collapse" : "Manage"}
                    </button>
                  </span>
                </div>
              );

              if (!open) return <div key={lead.id}>{row}</div>;

              return (
                <div key={lead.id} className="rounded-md border border-primary bg-highlight">
                  <div className="border-b border-line">{row}</div>
                  <div id={panelId} className="flex w-full flex-col gap-6 p-5">
                    <div className="flex w-full flex-col gap-6 lg:flex-row">
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <h3 className="font-heading text-14 font-extrabold leading-native text-ink">
                          Student Background &amp; Query
                        </h3>
                        <p className="font-sans text-13 leading-native text-body">
                          <strong className="font-bold">Education: </strong>
                          {lead.qualification ?? "Not provided"}
                        </p>
                        <p className="font-sans text-13 leading-native text-body">
                          <strong className="font-bold">Experience: </strong>
                          {lead.experienceLevel ?? "Not provided"}
                        </p>
                        <p className="font-sans text-13 leading-native text-body">
                          <strong className="font-bold">Student Note: </strong>
                          {lead.message ?? "No message submitted with this enquiry."}
                        </p>
                        <p className="font-sans text-12 leading-native text-muted">
                          Source: {sourceLabels[lead.source] ?? "Contact form"} · Consent:{" "}
                          {lead.consent ? "Given" : "Not given"}
                        </p>
                      </div>
                      <div className="flex w-full flex-col gap-3 lg:w-[380px] lg:shrink-0">
                        <h3 className="font-heading text-14 font-extrabold leading-native text-ink">
                          Admin Interaction &amp; Actions
                        </h3>
                        <div className="flex w-full flex-col gap-1.5 rounded-sm border border-line bg-card p-3">
                          <span className="font-sans text-11 font-bold leading-native text-muted">
                            ADMIN NOTES {lead.latestNote ? `(Latest ${formatShortDate(lead.latestNote.createdAt)}${lead.latestNote.adminName ? ` · ${lead.latestNote.adminName}` : ""})` : ""}
                          </span>
                          <p className="font-sans text-13 leading-native text-ink">
                            {lead.latestNote?.note ?? "No notes yet."}
                          </p>
                        </div>
                        <label className="flex w-full flex-col gap-1.5">
                          <span className="sr-only">New admin note</span>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a new note for this lead…"
                            className="min-h-[64px] w-full resize-none rounded-sm border border-line bg-card p-3 font-sans text-13 leading-native text-ink placeholder:text-muted focus:border-primary focus-visible:outline-none"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-sans text-13 leading-native text-body whitespace-nowrap">
                          Quick Update Status:
                        </span>
                        <span className="flex flex-wrap items-start gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setStatus(lead.id, "contacted")}
                            className="rounded-pill bg-teal-soft px-2.5 py-1 font-sans text-11 font-bold leading-native text-teal transition-colors hover:bg-teal/20 disabled:opacity-50"
                          >
                            Mark Contacted
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setStatus(lead.id, "follow-up")}
                            className="rounded-pill bg-warning-soft px-2.5 py-1 font-sans text-11 font-bold leading-native text-warning transition-colors hover:bg-warning/20 disabled:opacity-50"
                          >
                            Follow-up
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setStatus(lead.id, "converted")}
                            className="rounded-pill bg-success-soft px-2.5 py-1 font-sans text-11 font-bold leading-native text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                          >
                            Mark Converted
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setStatus(lead.id, "lost")}
                            className="rounded-pill bg-danger-soft px-2.5 py-1 font-sans text-11 font-bold leading-native text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
                          >
                            Mark Lost
                          </button>
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={pending || !note.trim()}
                        onClick={() => saveNote(lead.id)}
                        className="rounded-xs bg-primary px-4 py-2 font-sans text-13 font-bold leading-native text-white transition-colors hover:bg-[#ff6b36] disabled:opacity-50"
                      >
                        Add Note &amp; Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {rows.length === 0 ? (
              <p className="py-10 text-center font-sans text-14 text-muted">
                {hasFilters ? "No leads match the current filters." : "No enquiries received yet."}
              </p>
            ) : null}
          </div>
        </div>
        <Pagination {...pagination} />
      </Card>
    </>
  );
}
