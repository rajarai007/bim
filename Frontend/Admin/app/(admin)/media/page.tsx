import type { Metadata } from "next";
import { AdminPage } from "@/components/layout/page";
import { MediaGrid } from "@/components/media/media-grid";
import { listMedia } from "@/features/media/service";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const items = await listMedia();
  return (
    <AdminPage title="Media">
      <MediaGrid items={items} />
    </AdminPage>
  );
}
