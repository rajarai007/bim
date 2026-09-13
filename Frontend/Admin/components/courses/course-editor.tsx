"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { ImagePicker } from "@/components/ui/image-picker";
import { Switch } from "@/components/ui/switch";
import { saveCourse } from "@/features/courses/actions";
import { durationOptions, trainingModes } from "@/features/courses/constants";
import { routes } from "@/lib/constants";
import type { ActionState, AdminCourse, CategoryRecord } from "@/types";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Pretty JSON when modules carry descriptions, otherwise a simple list. */
function syllabusToText(course?: AdminCourse): string {
  if (!course?.syllabus.length) return "";
  if (course.syllabus.some((m) => m.description)) return JSON.stringify(course.syllabus, null, 2);
  return course.syllabus.map((m) => m.title).join("\n");
}

/** Two-column course form used for both "Add New Course" and "Edit". */
export function CourseEditor({
  course,
  categories,
  initialMessage,
}: {
  course?: AdminCourse;
  categories: CategoryRecord[];
  initialMessage?: string;
}) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(course));
  const [active, setActive] = useState(course ? course.status === "active" : true);
  const [featured, setFeatured] = useState(course?.isFeatured ?? false);
  const [imageUrl, setImageUrl] = useState<string | null>(course?.imageUrl ?? null);
  const [intent, setIntent] = useState<"draft" | "publish">("publish");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveCourse.bind(null, course?.id ?? null),
    initialMessage ? { ok: true, message: initialMessage } : undefined,
  );
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <input type="hidden" name="intent" value={intent} />
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={routes.courses}
          className="flex items-center gap-2 font-sans text-14 font-semibold leading-native text-body transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to Course List
        </Link>
        <div className="flex items-center gap-3">
          <FormStatus message={state?.ok ? state.message : undefined} error={state?.error} />
          <Button type="submit" variant="outline" onClick={() => setIntent("draft")} disabled={pending}>
            Save Draft
          </Button>
          <Button type="submit" onClick={() => setIntent("publish")} disabled={pending}>
            {pending ? "Saving…" : "Publish Course"}
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
        {/* Left column */}
        <div className="flex w-full min-w-0 flex-col gap-6 xl:flex-1">
          <Card className="flex flex-col gap-5 p-6">
            <CardTitle size="lg">Basic Information</CardTitle>
            <div className="flex w-full flex-col gap-4">
              <Field label="Course Title *" htmlFor="title" error={errors.title}>
                <Input
                  id="title"
                  name="title"
                  required
                  value={title}
                  placeholder="e.g. Revit Architecture Specialist Course"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
              </Field>
              <div className="flex w-full flex-col gap-4 sm:flex-row">
                <Field label="Category *" htmlFor="category" error={errors.categoryId}>
                  <Select id="category" name="category" defaultValue={course?.categoryId ?? categories[0]?.id}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Slug (URL Path) *" htmlFor="slug" error={errors.slug}>
                  <Input
                    id="slug"
                    name="slug"
                    required
                    value={slug}
                    placeholder="revit-architecture-specialist"
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                  />
                </Field>
              </div>
              <Field label="Short Description *" htmlFor="shortDescription" error={errors.shortDescription}>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  required
                  defaultValue={course?.shortDescription}
                  placeholder="One or two sentences shown on course cards."
                />
              </Field>
              <Field label="Full Detailed Description" htmlFor="fullDescription" error={errors.fullDescription}>
                <Textarea
                  id="fullDescription"
                  name="fullDescription"
                  defaultValue={course?.fullDescription ?? ""}
                  placeholder="Detailed syllabus highlights, benefits, and curriculum description..."
                />
              </Field>
            </div>
          </Card>

          <Card className="flex flex-col gap-5 p-6">
            <CardTitle size="lg">Course Highlights &amp; Content</CardTitle>
            <div className="flex w-full flex-col gap-4">
              <Field label="Eligibility *" htmlFor="eligibility" error={errors.eligibility}>
                <Input
                  id="eligibility"
                  name="eligibility"
                  required
                  defaultValue={course?.eligibility ?? ""}
                  placeholder="Diploma / Degree in Architecture, Interior Design or Civil Engineering"
                />
              </Field>
              <Field label="Who Should Join" htmlFor="whoShouldJoin" error={errors.whoShouldJoin}>
                <Input
                  id="whoShouldJoin"
                  name="whoShouldJoin"
                  defaultValue={course?.whoShouldJoin ?? ""}
                  placeholder="Civil Engineers, Architects, Interior Designers, BIM Drafters…"
                />
              </Field>
              <Field label="What You Will Learn (One per Line)" htmlFor="outcomes" error={errors.outcomes}>
                <Textarea
                  id="outcomes"
                  name="outcomes"
                  defaultValue={course?.outcomes.join("\n") ?? ""}
                  placeholder={"3D Building Modeling & Parametric Setup\nSheet Setup, Annotations & Technical Prints"}
                />
              </Field>
              <Field
                label="Syllabus Modules (JSON or List)"
                htmlFor="syllabus"
                error={errors.syllabus}
                hint='One module per line ("Module 1: Intro - description"), or a JSON array of { "title", "description" }.'
              >
                <Textarea
                  id="syllabus"
                  name="syllabus"
                  defaultValue={syllabusToText(course)}
                  placeholder="Module 1: …, Module 2: …"
                  className="min-h-[140px] font-mono text-13"
                />
              </Field>
              <Field label="Software Covered (Comma Separated)" htmlFor="software" error={errors.software}>
                <Input id="software" name="software" defaultValue={course?.software.join(", ") ?? ""} placeholder="Autodesk Revit, Dynamo, BIM 360" />
              </Field>
              <Field label="Career Opportunities" htmlFor="careers" error={errors.careers}>
                <Textarea
                  id="careers"
                  name="careers"
                  defaultValue={course?.careers.join(", ") ?? ""}
                  placeholder="Revit Architect, Parametric Modeler, BIM Documentation Specialist"
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex w-full flex-col gap-6 xl:w-[380px] xl:shrink-0">
          <Card className="flex flex-col gap-4 p-6">
            <CardTitle>Course Cover Image</CardTitle>
            <ImagePicker name="imageUrl" value={imageUrl} onChange={setImageUrl} hint="PNG, JPG up to 5MB (16:9 recommended)" />
            <Field label="Image Alt Text" htmlFor="imageAlt" error={errors.imageAlt}>
              <Input id="imageAlt" name="imageAlt" defaultValue={course?.imageAlt ?? ""} placeholder="Describe the image for accessibility" />
            </Field>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <CardTitle>Training Configuration</CardTitle>
            <Field label="Duration" htmlFor="duration" error={errors.durationWeeks}>
              <Select id="duration" name="duration" defaultValue={course?.durationWeeks ?? 12}>
                {durationOptions.map((d) => (
                  <option key={d.weeks} value={d.weeks}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Training Mode" htmlFor="mode" error={errors.trainingMode}>
              <Select id="mode" name="mode" defaultValue={course?.trainingMode ?? trainingModes[0]}>
                {trainingModes.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Batch Location" htmlFor="location" error={errors.batchLocation}>
              <Input id="location" name="location" defaultValue={course?.batchLocation ?? ""} placeholder="Noida Center" />
            </Field>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <CardTitle>Visibility &amp; Status</CardTitle>
            <div className="flex w-full items-center justify-between gap-4">
              <span className="flex flex-col gap-0.5 leading-native whitespace-nowrap">
                <span className="font-sans text-14 font-bold text-ink">Active Status</span>
                <span className="font-sans text-11 text-muted">Visible to students</span>
              </span>
              <Switch checked={active} onChange={setActive} label="Active status" name="active" />
            </div>
            <hr className="w-full border-0 border-t border-line" />
            <div className="flex w-full items-center justify-between gap-4">
              <span className="flex flex-col gap-0.5 leading-native whitespace-nowrap">
                <span className="font-sans text-14 font-bold text-ink">Featured Course</span>
                <span className="font-sans text-11 text-muted">Pin to homepage grid</span>
              </span>
              <Switch checked={featured} onChange={setFeatured} label="Featured course" name="featured" />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <CardTitle>SEO Engine Meta</CardTitle>
            <Field label="Meta Title" htmlFor="metaTitle" error={errors.metaTitle}>
              <Input id="metaTitle" name="metaTitle" defaultValue={course?.metaTitle ?? ""} placeholder="Course name | BIM Career" />
            </Field>
            <Field label="Meta Description" htmlFor="metaDescription" error={errors.metaDescription}>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                defaultValue={course?.metaDescription ?? ""}
                placeholder="Brief snippet for search engines..."
              />
            </Field>
          </Card>
        </div>
      </div>
    </form>
  );
}
