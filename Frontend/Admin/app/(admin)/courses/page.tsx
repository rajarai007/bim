import type { Metadata } from "next";
import { CourseTable } from "@/components/courses/course-table";
import { AdminPage } from "@/components/layout/page";
import { listCourseCategories, listCourses } from "@/features/courses/service";
import type { CourseStatus } from "@/types";

export const metadata: Metadata = { title: "Manage Courses" };

const statuses: CourseStatus[] = ["active", "draft", "inactive"];

export default async function CoursesPage({ searchParams }: PageProps<"/courses">) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const status = first(params.status);
  const [{ items, pagination }, categories] = await Promise.all([
    listCourses({
      page: Math.max(1, Number(first(params.page)) || 1),
      pageSize: 10,
      q: first(params.q),
      category: first(params.category),
      status: statuses.includes(status as CourseStatus) ? (status as CourseStatus) : "all",
    }),
    listCourseCategories(),
  ]);
  return (
    <AdminPage title="Manage Courses">
      <CourseTable courses={items} pagination={pagination} categories={categories} />
    </AdminPage>
  );
}
