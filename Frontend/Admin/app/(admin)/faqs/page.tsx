import type { Metadata } from "next";
import { FaqTable } from "@/components/catalog/catalog-tables";
import { AdminPage } from "@/components/layout/page";
import { listFaqCategories, listFaqs } from "@/features/catalog/service";

export const metadata: Metadata = { title: "FAQs" };

export default async function Page() {
  const [items, categories] = await Promise.all([listFaqs(), listFaqCategories()]);
  return (
    <AdminPage title="FAQs">
      <FaqTable items={items} categories={categories} />
    </AdminPage>
  );
}
