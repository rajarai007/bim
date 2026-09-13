import type { Metadata } from "next";
import { ProjectTable } from "@/components/catalog/catalog-tables";
import { AdminPage } from "@/components/layout/page";
import { listCategories, listProjects } from "@/features/catalog/service";

export const metadata: Metadata = { title: "Projects" };

export default async function Page() {
  const [items, categories] = await Promise.all([listProjects(), listCategories()]);
  return (
    <AdminPage title="Projects">
      <ProjectTable items={items} categories={categories} />
    </AdminPage>
  );
}
