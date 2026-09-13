import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      {children}
    </div>
  );
}
