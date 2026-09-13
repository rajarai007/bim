import type { Metadata } from "next";
import { AdminPage } from "@/components/layout/page";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/features/settings/service";

export const metadata: Metadata = { title: "Settings Workspace" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <AdminPage title="Settings Workspace">
      <SettingsForm settings={settings} />
    </AdminPage>
  );
}
