import Link from "next/link";
import { Download } from "lucide-react";
import { routes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category, Course } from "@/types";

const th =
  "px-3 py-4 text-left font-heading text-13 font-semibold uppercase tracking-[0.08em] leading-compact text-heading md:px-5 md:text-14";
const td = "px-3 py-4 align-top font-sans text-13 leading-compact text-body md:px-5 md:text-15";
const action =
  "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-2 font-sans text-12 font-semibold leading-native whitespace-nowrap transition-[background-color,color,translate,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 md:px-4 md:text-13";

/**
 * "Course Duration & Syllabus" table for a category: serial number, title,
 * duration and a syllabus download. The download route serves the uploaded
 * PDF, or one generated from the course content when none was uploaded.
 */
export function CourseDurationTable({ category, courses }: { category: Category; courses: Course[] }) {
  return (
    <div data-reveal="up" className="glass glass-edge table-shell w-full overflow-x-auto">
      {/* Fixed layout on phones so all four columns fit and titles wrap; the wrapper only scrolls as a last resort. */}
      <table className="w-full table-fixed border-collapse md:table-auto">
        <caption className="sr-only">Duration and syllabus of every {category.badge} course</caption>
        <thead>
          <tr>
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
            <tr key={course.slug}>
              <td className={cn(td, "font-heading text-muted")}>{index + 1}</td>
              <td className={cn(td, "font-semibold break-words hyphens-auto text-heading")}>
                <Link href={routes.course(category.slug, course.slug)} className="transition-colors hover:text-primary-bright">
                  {course.title}
                </Link>
              </td>
              <td className={cn(td, "md:whitespace-nowrap")}>{course.duration}</td>
              <td className={td}>
                <a
                  href={routes.courseSyllabus(category.slug, course.slug)}
                  download
                  className={cn(action, "bg-accent text-white hover:bg-accent-strong hover:shadow-[0_10px_24px_-10px_rgb(13_148_136/0.7)]")}
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
