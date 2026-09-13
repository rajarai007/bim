"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge, courseStatusMeta } from "@/components/ui/status-badge";
import { Table, TableScroll, Td, Th } from "@/components/ui/table";
import { useDebouncedParam, useUrlFilters } from "@/components/ui/use-url-filters";
import { deleteCourse, setCourseFeatured } from "@/features/courses/actions";
import { routes } from "@/lib/constants";
import { mediaUrl } from "@/lib/media";
import type { AdminCourse, CategoryRecord, Pagination as PaginationData } from "@/types";
import { cn } from "@/lib/utils";

export function CourseTable({
  courses,
  pagination,
  categories,
}: {
  courses: AdminCourse[];
  pagination: PaginationData;
  categories: CategoryRecord[];
}) {
  const { get, set } = useUrlFilters();
  const [query, setQuery] = useDebouncedParam("q");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ message?: string; error?: string }>({});

  const toggleFeatured = (course: AdminCourse) => {
    setBusyId(course.id);
    startTransition(async () => {
      const result = await setCourseFeatured(course.id, !course.isFeatured);
      setNotice(result?.error ? { error: result.error } : {});
      setBusyId(null);
    });
  };

  const remove = (course: AdminCourse) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setBusyId(course.id);
    startTransition(async () => {
      const result = await deleteCourse(course.id);
      setNotice(result?.error ? { error: result.error } : { message: result?.message });
      setBusyId(null);
    });
  };

  const hasFilters = Boolean(get("q") || get("category") || get("status"));

  return (
    <>
      <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <SearchInput
            placeholder="Search course name..."
            aria-label="Search course name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-[320px]"
          />
          <FilterSelect label="Filter by category" value={get("category", "all")} onChange={(e) => set({ category: e.target.value })}>
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Filter by status" value={get("status", "all")} onChange={(e) => set({ status: e.target.value })}>
            <option value="all">Active Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
        </div>
        <Button href={routes.courseNew} className="shrink-0">
          <Plus className="size-4" aria-hidden />
          Add New Course
        </Button>
      </Card>

      <Card className={cn("flex flex-col p-6 transition-opacity", pending && "opacity-70")}>
        <FormStatus message={notice.message} error={notice.error} className="pb-3" />
        <TableScroll>
          <Table className="min-w-[900px]">
            <thead>
              <tr>
                <Th className="w-[80px]">Image</Th>
                <Th>Course Name</Th>
                <Th className="w-[180px]">Category</Th>
                <Th className="w-[120px]">Duration</Th>
                <Th className="w-[110px]">Status</Th>
                <Th className="w-[90px]" align="center">Featured</Th>
                <Th className="w-[120px]" align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const meta = courseStatusMeta[course.status];
                const busy = busyId === course.id;
                return (
                  <tr key={course.id} className={cn(busy && "opacity-50")}>
                    <Td className="py-3">
                      <span className="relative block h-11 w-16 overflow-hidden rounded-xs bg-page">
                        <Image src={mediaUrl(course.imageUrl)} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                    </Td>
                    <Td className="max-w-0 truncate font-bold text-ink">
                      <Link href={routes.courseEdit(String(course.id))} className="hover:text-primary">
                        {course.title}
                      </Link>
                    </Td>
                    <Td>{course.categoryName}</Td>
                    <Td className="text-13">{course.duration}</Td>
                    <Td>
                      <StatusBadge tone={meta.tone} size="sm">
                        {meta.label}
                      </StatusBadge>
                    </Td>
                    <Td align="center">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleFeatured(course)}
                        aria-pressed={course.isFeatured}
                        aria-label={`${course.isFeatured ? "Remove" : "Mark"} ${course.title} as featured`}
                        className="inline-flex text-muted transition-colors hover:text-warning disabled:opacity-50"
                      >
                        <Star
                          className={cn("size-[18px]", course.isFeatured && "fill-warning text-warning")}
                          aria-hidden
                        />
                      </button>
                    </Td>
                    <Td align="right">
                      <span className="inline-flex items-start gap-2">
                        <Link
                          href={routes.courseEdit(String(course.id))}
                          aria-label={`Edit ${course.title}`}
                          className="flex rounded-xs bg-page p-1.5 text-body transition-colors hover:bg-line/60"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(course)}
                          aria-label={`Delete ${course.title}`}
                          className="flex rounded-xs bg-danger-tint p-1.5 text-danger transition-colors hover:bg-danger/15 disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </button>
                      </span>
                    </Td>
                  </tr>
                );
              })}
              {courses.length === 0 ? (
                <tr>
                  <Td colSpan={7} className="py-10 text-center text-muted">
                    {hasFilters ? "No courses match the current filters." : "No courses yet — add your first course."}
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </TableScroll>
        <Pagination {...pagination} />
      </Card>
    </>
  );
}
