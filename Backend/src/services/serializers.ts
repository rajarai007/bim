/**
 * Shapes database entities into the JSON contracts consumed by the client
 * website (public) and the admin console.
 */
import type { Category, Course, Enquiry, Faq, Project, SiteSettings, Testimonial, Trainer } from "../models";
import { formatDurationOption, formatExperience, formatMonths, formatWeeks } from "../utils/format";

export type ImageDto = { src: string; alt: string };

function image(src: string | null, alt: string | null, fallbackAlt: string): ImageDto | null {
  return src ? { src, alt: alt ?? fallbackAlt } : null;
}

/* ---------------------------------------------------------------- public */
export function publicCategory(c: Category) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    badge: c.badge,
    summary: c.summary,
    tagline: c.tagline,
    description: c.description,
    icon: c.icon,
    footerLabel: c.footerLabel,
    overviewTitle: c.overviewTitle,
    courseCount: c.courseCount ?? 0,
  };
}

export function publicCourseCard(c: Course) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    badge: c.categoryBadge,
    description: c.shortDescription,
    duration: formatMonths(c.durationWeeks),
    durationWeeks: c.durationWeeks,
    image: image(c.imageUrl, c.imageAlt, c.title),
    featured: c.isFeatured,
    category: { id: c.categoryId, slug: c.categorySlug, name: c.categoryName, badge: c.categoryBadge },
  };
}

export function publicCourseDetail(c: Course, related: Course[]) {
  return {
    ...publicCourseCard(c),
    detail: {
      heroTitle: c.title,
      heroDescription: c.fullDescription ?? c.shortDescription,
      meta: {
        duration: formatMonths(c.durationWeeks),
        mode: c.trainingMode,
        admissions: c.batchLocation ?? "",
      },
      overview: c.fullDescription ?? c.shortDescription,
      outcomes: c.outcomes,
      modules: c.syllabus,
      software: c.software,
      whoShouldJoin: c.whoShouldJoin ?? "",
      eligibility: c.eligibility ?? "",
      careers: c.careers,
    },
    seo: { title: c.metaTitle ?? c.title, description: c.metaDescription ?? c.shortDescription },
    related: related.map(publicCourseCard),
  };
}

export function publicTrainer(t: Trainer) {
  return {
    id: t.id,
    name: t.name,
    role: t.role,
    homeRole: t.homeRole,
    specialization: t.specialization,
    bio: t.bio,
    experience: `${formatExperience(t.experienceYears)} Experience`,
    experienceYears: t.experienceYears,
    tags: t.tags,
    image: image(t.imageUrl, t.imageAlt, t.name),
    linkedin: t.linkedinUrl,
    showOnHome: t.showOnHome,
  };
}

export function publicTestimonial(t: Testimonial) {
  return {
    id: t.id,
    quote: t.quote,
    name: t.name,
    program: t.program,
    rating: t.rating,
    avatar: image(t.avatarUrl, t.name, t.name),
  };
}

export function publicProject(p: Project) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    software: p.software,
    image: image(p.imageUrl, p.imageAlt, p.title),
    showOnHome: p.showOnHome,
    category: { id: p.categoryId, slug: p.categorySlug, name: p.categoryName, badge: p.categoryBadge },
  };
}

export function publicFaq(f: Faq) {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    showOnHome: f.showOnHome,
    category: { id: f.faqCategoryId, slug: f.categorySlug, label: f.categoryLabel },
  };
}

export function publicSettings(s: SiteSettings) {
  return {
    name: s.academyName,
    contact: {
      phone: s.phone,
      whatsapp: s.whatsapp,
      email: s.email,
      address: s.address,
      hours: s.workingHours,
    },
    social: {
      instagram: s.instagramUrl,
      facebook: s.facebookUrl,
      linkedin: s.linkedinUrl,
      youtube: s.youtubeUrl,
    },
    logoUrl: s.logoUrl,
    gaMeasurementId: s.gaMeasurementId,
  };
}

/* ----------------------------------------------------------------- admin */
export function adminCourse(c: Course) {
  return {
    ...c,
    duration: formatWeeks(c.durationWeeks),
    durationOption: formatDurationOption(c.durationWeeks),
  };
}

export function adminTrainer(t: Trainer) {
  return { ...t, experience: formatExperience(t.experienceYears) };
}

export function adminEnquiry(e: Enquiry) {
  return e;
}
