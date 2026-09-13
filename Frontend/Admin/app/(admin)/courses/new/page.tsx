import type { Metadata } from "next";
import { CourseEditor } from "@/components/courses/course-editor";
import { AdminPage } from "@/components/layout/page";
import { listCourseCategories } from "@/features/courses/service";

export const metadata: Metadata = { title: "Add New Course" };

export default async function NewCoursePage() {
  const categories = await listCourseCategories();
  return (
    <AdminPage title="Add New Course">
      <CourseEditor categories={categories} />
    </AdminPage>
  );
}
