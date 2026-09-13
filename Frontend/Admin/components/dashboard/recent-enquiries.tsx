import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge, leadStatusMeta } from "@/components/ui/status-badge";
import { Table, TableScroll, Td, Th } from "@/components/ui/table";
import { routes } from "@/lib/constants";
import { formatReceivedAt } from "@/lib/format";
import type { Lead } from "@/types";

export function RecentEnquiries({ leads }: { leads: Lead[] }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex w-full items-center justify-between gap-4">
        <CardTitle size="lg">Recent Course Enquiries</CardTitle>
        <Link
          href={routes.enquiries}
          className="flex items-center gap-1 font-sans text-13 font-bold leading-native text-primary transition-colors hover:text-[#ff6b36]"
        >
          View All Enquiries
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <TableScroll>
        <Table className="min-w-[760px]">
          <thead>
            <tr>
              <Th className="w-[180px]">Student Name</Th>
              <Th>Requested Course</Th>
              <Th className="w-[140px]">Date &amp; Time</Th>
              <Th className="w-[120px]">Status</Th>
              <Th className="w-[100px]" align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const meta = leadStatusMeta[lead.status];
              return (
                <tr key={lead.id}>
                  <Td className="font-semibold text-ink">{lead.fullName}</Td>
                  <Td className="max-w-0 truncate">{lead.courseName ?? "General enquiry"}</Td>
                  <Td className="text-13 text-muted">{formatReceivedAt(lead.createdAt)}</Td>
                  <Td>
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                  </Td>
                  <Td align="right">
                    <Link
                      href={routes.enquiries}
                      className="inline-flex rounded-sm border border-line bg-page px-3 py-1.5 font-sans text-12 font-bold leading-native text-body transition-colors hover:bg-line/60"
                    >
                      Manage
                    </Link>
                  </Td>
                </tr>
              );
            })}
            {leads.length === 0 ? (
              <tr>
                <Td colSpan={5} className="py-8 text-center text-muted">
                  No enquiries received yet.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </TableScroll>
    </Card>
  );
}
