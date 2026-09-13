export const adminConfig = {
  appName: "BIM Career Academy",
  consoleVersion: "Admin Console v1.0",
  /** Avatar shown next to the signed-in admin in the top bar. */
  avatar: "/images/avatar-admin.png",
  /** Public website origin (used by the Content screen's "open page" links). */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
} as const;

export const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};
