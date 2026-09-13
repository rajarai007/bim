import { Card } from "@/components/ui/card";

/** Skeleton shown while an admin screen fetches its data. */
export default function Loading() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col" aria-busy="true" aria-label="Loading">
      <div className="h-topbar w-full border-b border-line bg-card" />
      <div className="flex w-full flex-col gap-6 p-4 md:p-6 xl:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="h-[120px] animate-pulse bg-page">{null}</Card>
          ))}
        </div>
        <Card className="h-[420px] animate-pulse bg-page">{null}</Card>
      </div>
    </div>
  );
}
