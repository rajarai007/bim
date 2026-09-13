import type { Metadata } from "next";
import { AdminPage } from "@/components/layout/page";
import { SeoForm } from "@/components/settings/seo-form";
import { listPages } from "@/features/settings/service";

export const metadata: Metadata = { title: "SEO" };

export default async function SeoPage() {
  const pages = await listPages();
  return (
    <AdminPage title="SEO">
      <SeoForm pages={pages} />
    </AdminPage>
  );
}
