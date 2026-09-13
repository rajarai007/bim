import { adminFetch } from "@/lib/api";
import type { AcademySettings, SitePage } from "@/types";

export async function getSettings(): Promise<AcademySettings> {
  return adminFetch<AcademySettings>("/admin/settings");
}

export async function listPages(): Promise<SitePage[]> {
  return adminFetch<SitePage[]>("/admin/pages");
}
