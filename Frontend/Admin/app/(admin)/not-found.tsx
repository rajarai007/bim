import { AdminPage } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { routes } from "@/lib/constants";

export default function NotFound() {
  return (
    <AdminPage title="Not Found">
      <Card className="flex flex-col items-center gap-4 p-12 text-center">
        <h2 className="font-heading text-24 font-extrabold leading-native text-ink">Page not found</h2>
        <p className="max-w-[420px] font-sans text-14 leading-native text-body">
          The screen you requested doesn&apos;t exist or has been moved.
        </p>
        <Button href={routes.dashboard}>Back to Dashboard</Button>
      </Card>
    </AdminPage>
  );
}
