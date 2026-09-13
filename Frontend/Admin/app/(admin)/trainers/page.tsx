import type { Metadata } from "next";
import { TrainerTable } from "@/components/catalog/catalog-tables";
import { AdminPage } from "@/components/layout/page";
import { listTrainers } from "@/features/catalog/service";

export const metadata: Metadata = { title: "Trainers" };

export default async function Page() {
  const items = await listTrainers();
  return (
    <AdminPage title="Trainers">
      <TrainerTable items={items} />
    </AdminPage>
  );
}
