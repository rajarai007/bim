import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditor } from "@/components/courses/course-editor";
import { AdminPage } from "@/components/layout/page";
import { getCourse, listCourseCategories } from "@/features/courses/service";

type Props = PageProps<"/courses/[id]/edit">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);
  // Thrown here (before the loading boundary streams) so the response carries a real 404 status.
  if (!course) notFound();
  return { title: `Edit: ${course.title}` };
}

export default async function EditCoursePage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [course, categories] = await Promise.all([getCourse(id), listCourseCategories()]);
  if (!course) notFound();
  const saved = Array.isArray(query.saved) ? query.saved[0] : query.saved;
  const messages: Record<string, string> = { draft: "Draft saved.", published: "Course published.", saved: "Course saved." };
  const initialMessage = saved ? messages[saved] : undefined;
  return (
    <AdminPage title="Edit Course">
      <CourseEditor key={course.updatedAt} course={course} categories={categories} initialMessage={initialMessage} />
    </AdminPage>
  );
}
