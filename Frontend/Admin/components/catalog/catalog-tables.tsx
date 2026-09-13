"use client";

import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";
import { EntityDialog, ToggleRow } from "@/components/catalog/entity-dialog";
import { ListToolbar } from "@/components/catalog/list-toolbar";
import { RowActions } from "@/components/catalog/row-actions";
import { useCatalogList } from "@/components/catalog/use-catalog-list";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { ImagePicker } from "@/components/ui/image-picker";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableScroll, Td, Th } from "@/components/ui/table";
import { categoryIcons } from "@/features/catalog/constants";
import { mediaUrl } from "@/lib/media";
import type { CategoryRecord, FaqCategory, FaqRecord, ProjectRecord, TestimonialRecord, Tone, TrainerRecord } from "@/types";
import { cn } from "@/lib/utils";

const statusTone: Record<string, Tone> = {
  active: "success",
  inactive: "muted",
  published: "success",
  draft: "warning",
  pending: "info",
};

function StatusPill({ status }: { status: string }) {
  return (
    <StatusBadge tone={statusTone[status] ?? "muted"} size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </StatusBadge>
  );
}

function pageInfo(count: number) {
  return { page: 1, pageSize: Math.max(count, 1), total: count, totalPages: 1 };
}

const pickCategory = (c: CategoryRecord) => `${c.name} ${c.slug}`;
const pickTrainer = (t: TrainerRecord) => `${t.name} ${t.role}`;
const pickTestimonial = (t: TestimonialRecord) => `${t.name} ${t.program}`;
const pickProject = (p: ProjectRecord) => `${p.title} ${p.categoryName}`;
const pickFaq = (f: FaqRecord) => `${f.question} ${f.categoryLabel}`;

/* ------------------------------------------------------------------------ */
export function CategoryTable({ items }: { items: CategoryRecord[] }) {
  const list = useCatalogList("categories", items, pickCategory);
  const c = list.editing;
  return (
    <>
      <ListToolbar placeholder="Search category..." query={list.query} onQueryChange={list.setQuery} action="Add Category" onAction={list.create} />
      <Card className={cn("flex flex-col p-6", list.pending && "opacity-70")}>
        <FormStatus message={list.notice.message} error={list.notice.error} className="pb-3" />
        <TableScroll>
          <Table className="min-w-[720px]">
            <thead>
              <tr>
                <Th>Category Name</Th>
                <Th className="w-[240px]">Slug</Th>
                <Th className="w-[120px]" align="center">Courses</Th>
                <Th className="w-[110px]">Status</Th>
                <Th className="w-[120px]" align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.visible.map((item) => (
                <tr key={item.id}>
                  <Td className="font-bold text-ink">{item.name}</Td>
                  <Td className="text-13 text-muted">/courses/{item.slug}</Td>
                  <Td align="center">{item.courseCount}</Td>
                  <Td><StatusPill status={item.status} /></Td>
                  <Td align="right">
                    <RowActions label={item.name} onEdit={() => list.edit(item)} onDelete={() => list.remove(item, `"${item.name}"`)} disabled={list.pending} />
                  </Td>
                </tr>
              ))}
              {list.visible.length === 0 ? (
                <tr><Td colSpan={5} className="py-10 text-center text-muted">{items.length ? "No categories match your search." : "No categories yet."}</Td></tr>
              ) : null}
            </tbody>
          </Table>
        </TableScroll>
        <Pagination {...pageInfo(list.visible.length)} />
      </Card>

      <EntityDialog entity="categories" id={c?.id ?? null} title={c ? "Edit Category" : "Add Category"} open={list.open} onClose={list.close} onSaved={list.saved} size="lg">
        {(errors) => (
          <div key={c?.id ?? "new"} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Category Name *" htmlFor="cat-name" error={errors.name}>
              <Input id="cat-name" name="name" required defaultValue={c?.name} placeholder="BIM & Digital Construction" />
            </Field>
            <Field label="Slug (URL Path) *" htmlFor="cat-slug" error={errors.slug}>
              <Input id="cat-slug" name="slug" required defaultValue={c?.slug} placeholder="bim-digital-construction" />
            </Field>
            <Field label="Badge Label *" htmlFor="cat-badge" error={errors.badge} hint="Short label used on course cards and filters">
              <Input id="cat-badge" name="badge" required defaultValue={c?.badge} placeholder="BIM" />
            </Field>
            <Field label="Icon" htmlFor="cat-icon" error={errors.icon}>
              <Select id="cat-icon" name="icon" defaultValue={c?.icon ?? "box"}>
                {categoryIcons.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>
            </Field>
            <Field label="Homepage Summary *" htmlFor="cat-summary" error={errors.summary} className="md:col-span-2">
              <Textarea id="cat-summary" name="summary" required defaultValue={c?.summary} className="min-h-[72px]" />
            </Field>
            <Field label="Tagline *" htmlFor="cat-tagline" error={errors.tagline} className="md:col-span-2" hint="Shown under the heading on the courses overview page">
              <Input id="cat-tagline" name="tagline" required defaultValue={c?.tagline} />
            </Field>
            <Field label="Description *" htmlFor="cat-description" error={errors.description} className="md:col-span-2" hint="Long description on the category landing page">
              <Textarea id="cat-description" name="description" required defaultValue={c?.description} />
            </Field>
            <Field label="Overview Title" htmlFor="cat-overview" error={errors.overviewTitle} hint="Heading on the courses overview page (defaults to name)">
              <Input id="cat-overview" name="overviewTitle" defaultValue={c?.overviewTitle} />
            </Field>
            <Field label="Footer Label" htmlFor="cat-footer" error={errors.footerLabel} hint="Link text in the website footer (defaults to name)">
              <Input id="cat-footer" name="footerLabel" defaultValue={c?.footerLabel} />
            </Field>
            <div className="md:col-span-2">
              <ToggleRow name="active" label="Active" hint="Inactive categories and their courses are hidden from the website" defaultChecked={c ? c.status === "active" : true} />
            </div>
          </div>
        )}
      </EntityDialog>
    </>
  );
}

/* ------------------------------------------------------------------------ */
export function TrainerTable({ items }: { items: TrainerRecord[] }) {
  const list = useCatalogList("trainers", items, pickTrainer);
  const t = list.editing;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const openCreate = () => { setImageUrl(null); list.create(); };
  const openEdit = (item: TrainerRecord) => { setImageUrl(item.imageUrl); list.edit(item); };
  return (
    <>
      <ListToolbar placeholder="Search trainer name..." query={list.query} onQueryChange={list.setQuery} action="Add Trainer" onAction={openCreate} />
      <Card className={cn("flex flex-col p-6", list.pending && "opacity-70")}>
        <FormStatus message={list.notice.message} error={list.notice.error} className="pb-3" />
        <TableScroll>
          <Table className="min-w-[860px]">
            <thead>
              <tr>
                <Th className="w-[80px]">Photo</Th>
                <Th>Trainer</Th>
                <Th className="w-[200px]">Role</Th>
                <Th className="w-[120px]">Experience</Th>
                <Th className="w-[240px]">Expertise</Th>
                <Th className="w-[110px]">Status</Th>
                <Th className="w-[120px]" align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.visible.map((item) => (
                <tr key={item.id}>
                  <Td className="py-3">
                    <span className="relative block size-11 overflow-hidden rounded-pill bg-page">
                      <Image src={mediaUrl(item.imageUrl)} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                  </Td>
                  <Td className="font-bold text-ink">
                    {item.name}
                    {item.showOnHome ? <span className="ml-2 rounded-xs bg-primary-soft px-1.5 py-0.5 font-sans text-11 font-bold text-primary">HOME</span> : null}
                  </Td>
                  <Td>{item.role}</Td>
                  <Td className="text-13">{item.experience}</Td>
                  <Td>
                    <span className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-xs bg-page px-1.5 py-0.5 font-sans text-11 leading-native text-body">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </Td>
                  <Td><StatusPill status={item.status} /></Td>
                  <Td align="right">
                    <RowActions label={item.name} onEdit={() => openEdit(item)} onDelete={() => list.remove(item, item.name)} disabled={list.pending} />
                  </Td>
                </tr>
              ))}
              {list.visible.length === 0 ? (
                <tr><Td colSpan={7} className="py-10 text-center text-muted">{items.length ? "No trainers match your search." : "No trainers yet."}</Td></tr>
              ) : null}
            </tbody>
          </Table>
        </TableScroll>
        <Pagination {...pageInfo(list.visible.length)} />
      </Card>

      <EntityDialog entity="trainers" id={t?.id ?? null} title={t ? "Edit Trainer" : "Add Trainer"} open={list.open} onClose={list.close} onSaved={list.saved} size="lg">
        {(errors) => (
          <div key={t?.id ?? "new"} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full Name *" htmlFor="tr-name" error={errors.name}>
              <Input id="tr-name" name="name" required defaultValue={t?.name} placeholder="Ar. Rajesh Kumar" />
            </Field>
            <Field label="Role *" htmlFor="tr-role" error={errors.role}>
              <Input id="tr-role" name="role" required defaultValue={t?.role} placeholder="Senior BIM Consultant" />
            </Field>
            <Field label="Homepage Role" htmlFor="tr-homeRole" error={errors.homeRole} hint="Shorter role shown on the homepage card">
              <Input id="tr-homeRole" name="homeRole" defaultValue={t?.homeRole ?? ""} placeholder="Principal BIM Architect" />
            </Field>
            <Field label="Specialization" htmlFor="tr-spec" error={errors.specialization}>
              <Input id="tr-spec" name="specialization" defaultValue={t?.specialization ?? ""} placeholder="Revit Master & BIM 360" />
            </Field>
            <Field label="Bio *" htmlFor="tr-bio" error={errors.bio} className="md:col-span-2">
              <Textarea id="tr-bio" name="bio" required defaultValue={t?.bio} className="min-h-[80px]" />
            </Field>
            <Field label="Years of Experience *" htmlFor="tr-exp" error={errors.experienceYears}>
              <Input id="tr-exp" name="experienceYears" type="number" min={0} max={80} required defaultValue={t?.experienceYears ?? 5} />
            </Field>
            <Field label="Expertise Tags (Comma Separated)" htmlFor="tr-tags" error={errors.tags}>
              <Input id="tr-tags" name="tags" defaultValue={t?.tags.join(", ")} placeholder="Revit, Navisworks, BIM 360" />
            </Field>
            <Field label="LinkedIn URL" htmlFor="tr-linkedin" error={errors.linkedinUrl}>
              <Input id="tr-linkedin" name="linkedinUrl" type="url" defaultValue={t?.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/…" />
            </Field>
            <Field label="Photo Alt Text" htmlFor="tr-alt" error={errors.imageAlt}>
              <Input id="tr-alt" name="imageAlt" defaultValue={t?.imageAlt ?? ""} />
            </Field>
            <div className="md:col-span-2">
              <span className="mb-2 block font-sans text-13 font-bold leading-native text-body">Photo</span>
              <ImagePicker name="imageUrl" value={imageUrl} onChange={setImageUrl} shape="square" label="Click to upload photo" />
            </div>
            <ToggleRow name="showOnHome" label="Show on Homepage" hint="Featured in the “Meet Our Expert Trainers” row" defaultChecked={t?.showOnHome ?? false} />
            <ToggleRow name="active" label="Active" hint="Inactive trainers are hidden from the website" defaultChecked={t ? t.status === "active" : true} />
          </div>
        )}
      </EntityDialog>
    </>
  );
}

/* ------------------------------------------------------------------------ */
export function TestimonialTable({ items }: { items: TestimonialRecord[] }) {
  const list = useCatalogList("testimonials", items, pickTestimonial);
  const t = list.editing;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const openCreate = () => { setAvatarUrl(null); list.create(); };
  const openEdit = (item: TestimonialRecord) => { setAvatarUrl(item.avatarUrl); list.edit(item); };
  return (
    <>
      <ListToolbar placeholder="Search student name..." query={list.query} onQueryChange={list.setQuery} action="Add Testimonial" onAction={openCreate} />
      <Card className={cn("flex flex-col p-6", list.pending && "opacity-70")}>
        <FormStatus message={list.notice.message} error={list.notice.error} className="pb-3" />
        <TableScroll>
          <Table className="min-w-[860px]">
            <thead>
              <tr>
                <Th className="w-[160px]">Student</Th>
                <Th className="w-[240px]">Program</Th>
                <Th>Excerpt</Th>
                <Th className="w-[110px]">Rating</Th>
                <Th className="w-[110px]">Status</Th>
                <Th className="w-[120px]" align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.visible.map((item) => (
                <tr key={item.id}>
                  <Td className="font-bold text-ink">{item.name}</Td>
                  <Td className="text-13">{item.program}</Td>
                  <Td className="max-w-0 truncate text-13">{item.quote}</Td>
                  <Td>
                    <span className="flex items-center gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={i < item.rating ? "size-3.5 fill-warning text-warning" : "size-3.5 text-line"} aria-hidden />
                      ))}
                    </span>
                  </Td>
                  <Td><StatusPill status={item.status} /></Td>
                  <Td align="right">
                    <RowActions label={`testimonial by ${item.name}`} onEdit={() => openEdit(item)} onDelete={() => list.remove(item, `the testimonial by ${item.name}`)} disabled={list.pending} />
                  </Td>
                </tr>
              ))}
              {list.visible.length === 0 ? (
                <tr><Td colSpan={6} className="py-10 text-center text-muted">{items.length ? "No testimonials match your search." : "No testimonials yet."}</Td></tr>
              ) : null}
            </tbody>
          </Table>
        </TableScroll>
        <Pagination {...pageInfo(list.visible.length)} />
      </Card>

      <EntityDialog entity="testimonials" id={t?.id ?? null} title={t ? "Edit Testimonial" : "Add Testimonial"} open={list.open} onClose={list.close} onSaved={list.saved}>
        {(errors) => (
          <div key={t?.id ?? "new"} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Student Name *" htmlFor="ts-name" error={errors.name}>
              <Input id="ts-name" name="name" required defaultValue={t?.name} />
            </Field>
            <Field label="Program *" htmlFor="ts-program" error={errors.program}>
              <Input id="ts-program" name="program" required defaultValue={t?.program} placeholder="Revit Architecture & BIM Mastery Graduate" />
            </Field>
            <Field label="Quote *" htmlFor="ts-quote" error={errors.quote} className="md:col-span-2">
              <Textarea id="ts-quote" name="quote" required defaultValue={t?.quote} />
            </Field>
            <Field label="Rating (1–5) *" htmlFor="ts-rating" error={errors.rating}>
              <Select id="ts-rating" name="rating" defaultValue={t?.rating ?? 5}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>
                ))}
              </Select>
            </Field>
            <div className="md:col-span-2">
              <span className="mb-2 block font-sans text-13 font-bold leading-native text-body">Student Photo</span>
              <ImagePicker name="avatarUrl" value={avatarUrl} onChange={setAvatarUrl} shape="square" label="Click to upload photo" />
            </div>
            <div className="md:col-span-2">
              <ToggleRow name="published" label="Published" hint="Only published testimonials appear on the website" defaultChecked={t ? t.status === "published" : false} />
            </div>
          </div>
        )}
      </EntityDialog>
    </>
  );
}

/* ------------------------------------------------------------------------ */
export function ProjectTable({ items, categories }: { items: ProjectRecord[]; categories: CategoryRecord[] }) {
  const list = useCatalogList("projects", items, pickProject);
  const p = list.editing;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const openCreate = () => { setImageUrl(null); list.create(); };
  const openEdit = (item: ProjectRecord) => { setImageUrl(item.imageUrl); list.edit(item); };
  return (
    <>
      <ListToolbar placeholder="Search project title..." query={list.query} onQueryChange={list.setQuery} action="Add Project" onAction={openCreate} />
      <Card className={cn("flex flex-col p-6", list.pending && "opacity-70")}>
        <FormStatus message={list.notice.message} error={list.notice.error} className="pb-3" />
        <TableScroll>
          <Table className="min-w-[860px]">
            <thead>
              <tr>
                <Th className="w-[80px]">Image</Th>
                <Th>Project Title</Th>
                <Th className="w-[140px]">Category</Th>
                <Th className="w-[260px]">Software</Th>
                <Th className="w-[110px]">Status</Th>
                <Th className="w-[120px]" align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.visible.map((item) => (
                <tr key={item.id}>
                  <Td className="py-3">
                    <span className="relative block h-11 w-16 overflow-hidden rounded-xs bg-page">
                      <Image src={mediaUrl(item.imageUrl)} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                  </Td>
                  <Td className="font-bold text-ink">
                    {item.title}
                    {item.showOnHome ? <span className="ml-2 rounded-xs bg-primary-soft px-1.5 py-0.5 font-sans text-11 font-bold text-primary">HOME</span> : null}
                  </Td>
                  <Td>{item.categoryBadge}</Td>
                  <Td>
                    <span className="flex flex-wrap gap-1.5">
                      {item.software.map((s) => (
                        <span key={s} className="rounded-xs bg-page px-1.5 py-0.5 font-sans text-11 leading-native text-body">
                          {s}
                        </span>
                      ))}
                    </span>
                  </Td>
                  <Td><StatusPill status={item.status} /></Td>
                  <Td align="right">
                    <RowActions label={item.title} onEdit={() => openEdit(item)} onDelete={() => list.remove(item, `"${item.title}"`)} disabled={list.pending} />
                  </Td>
                </tr>
              ))}
              {list.visible.length === 0 ? (
                <tr><Td colSpan={6} className="py-10 text-center text-muted">{items.length ? "No projects match your search." : "No projects yet."}</Td></tr>
              ) : null}
            </tbody>
          </Table>
        </TableScroll>
        <Pagination {...pageInfo(list.visible.length)} />
      </Card>

      <EntityDialog entity="projects" id={p?.id ?? null} title={p ? "Edit Project" : "Add Project"} open={list.open} onClose={list.close} onSaved={list.saved} size="lg">
        {(errors) => (
          <div key={p?.id ?? "new"} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Project Title *" htmlFor="pr-title" error={errors.title}>
              <Input id="pr-title" name="title" required defaultValue={p?.title} />
            </Field>
            <Field label="Category *" htmlFor="pr-category" error={errors.categoryId}>
              <Select id="pr-category" name="categoryId" defaultValue={p?.categoryId ?? categories[0]?.id}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Description *" htmlFor="pr-description" error={errors.description} className="md:col-span-2">
              <Textarea id="pr-description" name="description" required defaultValue={p?.description} className="min-h-[80px]" />
            </Field>
            <Field label="Software Used (Comma Separated)" htmlFor="pr-software" error={errors.software}>
              <Input id="pr-software" name="software" defaultValue={p?.software.join(", ")} placeholder="Revit, Navisworks, BIM 360" />
            </Field>
            <Field label="Image Alt Text" htmlFor="pr-alt" error={errors.imageAlt}>
              <Input id="pr-alt" name="imageAlt" defaultValue={p?.imageAlt ?? ""} />
            </Field>
            <div className="md:col-span-2">
              <span className="mb-2 block font-sans text-13 font-bold leading-native text-body">Project Image</span>
              <ImagePicker name="imageUrl" value={imageUrl} onChange={setImageUrl} />
            </div>
            <ToggleRow name="showOnHome" label="Show on Homepage" hint="Featured in the “Our Training Projects” showcase" defaultChecked={p?.showOnHome ?? false} />
            <ToggleRow name="published" label="Published" hint="Draft projects are hidden from the website" defaultChecked={p ? p.status === "published" : false} />
          </div>
        )}
      </EntityDialog>
    </>
  );
}

/* ------------------------------------------------------------------------ */
export function FaqTable({ items, categories }: { items: FaqRecord[]; categories: FaqCategory[] }) {
  const list = useCatalogList("faqs", items, pickFaq);
  const f = list.editing;
  return (
    <>
      <ListToolbar placeholder="Search question..." query={list.query} onQueryChange={list.setQuery} action="Add FAQ" onAction={list.create} />
      <Card className={cn("flex flex-col p-6", list.pending && "opacity-70")}>
        <FormStatus message={list.notice.message} error={list.notice.error} className="pb-3" />
        <TableScroll>
          <Table className="min-w-[860px]">
            <thead>
              <tr>
                <Th>Question</Th>
                <Th className="w-[200px]">Category</Th>
                <Th className="w-[120px]" align="center">On Homepage</Th>
                <Th className="w-[110px]">Status</Th>
                <Th className="w-[120px]" align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.visible.map((item) => (
                <tr key={item.id}>
                  <Td className="font-bold text-ink">{item.question}</Td>
                  <Td className="text-13">{item.categoryLabel}</Td>
                  <Td align="center" className="text-13">{item.showOnHome ? "Yes" : "—"}</Td>
                  <Td><StatusPill status={item.status} /></Td>
                  <Td align="right">
                    <RowActions label={item.question} onEdit={() => list.edit(item)} onDelete={() => list.remove(item, `“${item.question}”`)} disabled={list.pending} />
                  </Td>
                </tr>
              ))}
              {list.visible.length === 0 ? (
                <tr><Td colSpan={5} className="py-10 text-center text-muted">{items.length ? "No questions match your search." : "No FAQs yet."}</Td></tr>
              ) : null}
            </tbody>
          </Table>
        </TableScroll>
        <Pagination {...pageInfo(list.visible.length)} />
      </Card>

      <EntityDialog entity="faqs" id={f?.id ?? null} title={f ? "Edit FAQ" : "Add FAQ"} open={list.open} onClose={list.close} onSaved={list.saved}>
        {(errors) => (
          <div key={f?.id ?? "new"} className="flex flex-col gap-4">
            <Field label="Question *" htmlFor="fq-question" error={errors.question}>
              <Input id="fq-question" name="question" required defaultValue={f?.question} />
            </Field>
            <Field label="Answer *" htmlFor="fq-answer" error={errors.answer}>
              <Textarea id="fq-answer" name="answer" required defaultValue={f?.answer} />
            </Field>
            <Field label="Category *" htmlFor="fq-category" error={errors.faqCategoryId}>
              <Select id="fq-category" name="faqCategoryId" defaultValue={f?.faqCategoryId ?? categories[0]?.id}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <ToggleRow name="showOnHome" label="Show on Homepage" hint="Included in the homepage FAQ preview" defaultChecked={f?.showOnHome ?? false} />
            <ToggleRow name="published" label="Published" hint="Draft questions are hidden from the website" defaultChecked={f ? f.status === "published" : false} />
          </div>
        )}
      </EntityDialog>
    </>
  );
}
