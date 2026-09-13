import type { Metadata } from "next";
import { CategoryTable } from "@/components/catalog/catalog-tables";
import { AdminPage } from "@/components/layout/page";
import { listCategories } from "@/features/catalog/service";

export const metadata: Metadata = { title: "Categories" };

export default async function Page() {
  const items = await listCategories();
  return (
    <AdminPage title="Categories">
      <CategoryTable items={items} />
    </AdminPage>
  );
}
