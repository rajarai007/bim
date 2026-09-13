import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { getSession } from "@/features/auth/server";
import { adminConfig, roleLabels } from "@/lib/config";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Top bar + padded, scrollable content area for every admin screen. */
export async function AdminPage({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const session = await getSession();
  const user = {
    name: session?.name ?? "Administrator",
    role: roleLabels[session?.role ?? "admin"] ?? "Admin",
    avatar: session?.avatarUrl ? mediaUrl(session.avatarUrl) : adminConfig.avatar,
  };
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <TopBar title={title} user={user} />
      <main className={cn("flex w-full flex-col gap-6 p-4 md:p-6 xl:p-8", className)}>{children}</main>
    </div>
  );
}
