import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPage } from "@/components/layout/page";
import { PasswordForm } from "@/components/profile/password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { getSession } from "@/features/auth/server";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/logout?reason=expired");
  return (
    <AdminPage title="My Profile">
      <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
        <div className="flex w-full min-w-0 flex-col xl:flex-1">
          <ProfileForm user={session} />
        </div>
        <div className="flex w-full flex-col gap-6 xl:w-[440px] xl:shrink-0">
          <PasswordForm />
        </div>
      </div>
    </AdminPage>
  );
}
