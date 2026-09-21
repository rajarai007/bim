import Link from "next/link";
import { Download } from "lucide-react";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, Course } from "@/types";

const th =
  "border border-line/40 px-3 py-4 text-left font-heading text-14 font-extrabold leading-compact text-white md:px-5 md:text-16";
const td = "border border-line px-3 py-4 align-top font-sans text-13 leading-compact text-body md:px-5 md:text-15";
const action =
  "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-2 font-sans text-12 font-bold leading-native whitespace-nowrap transition-[background-color,color,translate] duration-300 ease-brand hover:-translate-y-0.5 md:px-4 md:text-13";

/**
 * "Course Duration & Syllabus" table for a category: serial number, title,
 * duration and a syllabus download. The download route serves the uploaded
 * PDF, or one generated from the course content when none was uploaded.
 */
export function CourseDurationTable({ category, courses }: { category: Category; courses: Course[] }) {
  return (
    <div data-reveal="up" className="glass w-full overflow-x-auto rounded-md">
      {/* Fixed layout on phones so all four columns fit and titles wrap; the wrapper only scrolls as a last resort. */}
      <table className="w-full table-fixed border-collapse md:table-auto">
        <caption className="sr-only">Duration and syllabus of every {category.badge} course</caption>
        <thead>
          <tr className="bg-heading">
            <th scope="col" className={cn(th, "w-9 md:w-20")}>
              Sr. No.
            </th>
            <th scope="col" className={th}>
              Course Title
            </th>
            <th scope="col" className={cn(th, "w-22 md:w-36")}>
              Duration
            </th>
            <th scope="col" className={cn(th, "w-23 md:w-40")}>
              Syllabus
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr
              key={course.slug}
              className={cn(
                "transition-colors duration-300 ease-brand hover:bg-primary-soft/40",
                index % 2 ? "bg-surface/60" : "bg-canvas/50",
              )}
            >
              <td className={td}>{index + 1}</td>
              <td className={cn(td, "font-semibold break-words hyphens-auto text-heading")}>
                <Link href={routes.course(category.slug, course.slug)} className="transition-colors hover:text-primary">
                  {course.title}
                </Link>
              </td>
              <td className={cn(td, "md:whitespace-nowrap")}>{course.duration}</td>
              <td className={td}>
                <a
                  href={routes.courseSyllabus(category.slug, course.slug)}
                  download
                  className={cn(action, "bg-accent text-white hover:bg-accent-strong")}
                >
                  <Download className="hidden size-4 md:inline" aria-hidden />
                  Download
                  <span className="sr-only"> {course.title} syllabus</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
