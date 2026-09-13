import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { AdminPage } from "@/components/layout/page";
import { Card, CardTitle } from "@/components/ui/card";
import { Table, TableScroll, Td, Th } from "@/components/ui/table";
import { listPages } from "@/features/settings/service";
import { adminConfig } from "@/lib/config";
import { routes } from "@/lib/constants";
import { formatReceivedAt } from "@/lib/format";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage() {
  const pages = await listPages();
  return (
    <AdminPage title="Content">
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <CardTitle size="lg">Website Pages</CardTitle>
          <p className="font-sans text-12 leading-native text-muted">
            Public pages of the website with their section counts and SEO meta. Edit opens the SEO settings for the page.
          </p>
        </div>
        <TableScroll>
          <Table className="min-w-[720px]">
            <thead>
              <tr>
                <Th>Page</Th>
                <Th className="w-[200px]">Path</Th>
                <Th className="w-[120px]" align="center">Sections</Th>
                <Th className="w-[180px]">Last Updated</Th>
                <Th className="w-[120px]" align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <Td className="font-bold text-ink">{p.title}</Td>
                  <Td className="text-13 text-muted">{p.path}</Td>
                  <Td align="center">{p.sectionCount}</Td>
                  <Td className="text-13 text-muted">{formatReceivedAt(p.updatedAt)}</Td>
                  <Td align="right">
                    <span className="inline-flex items-start gap-2">
                      <Link
                        href={`${routes.seo}#page-${p.id}`}
                        aria-label={`Edit ${p.title}`}
                        className="flex rounded-xs bg-page p-1.5 text-body transition-colors hover:bg-line/60"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Link>
                      <a
                        href={`${adminConfig.siteUrl}${p.path}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${p.title} on the website`}
                        className="flex rounded-xs bg-page p-1.5 text-body transition-colors hover:bg-line/60"
                      >
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </span>
                  </Td>
                </tr>
              ))}
              {pages.length === 0 ? (
                <tr>
                  <Td colSpan={5} className="py-10 text-center text-muted">No pages configured.</Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </TableScroll>
      </Card>
    </AdminPage>
  );
}
