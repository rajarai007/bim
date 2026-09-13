import type { Metadata } from "next";
import { TestimonialTable } from "@/components/catalog/catalog-tables";
import { AdminPage } from "@/components/layout/page";
import { listTestimonials } from "@/features/catalog/service";

export const metadata: Metadata = { title: "Testimonials" };

export default async function Page() {
  const items = await listTestimonials();
  return (
    <AdminPage title="Testimonials">
      <TestimonialTable items={items} />
    </AdminPage>
  );
}
