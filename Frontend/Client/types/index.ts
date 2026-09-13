import type { LucideIcon } from "lucide-react";

export type ImageAsset = {
  src: string;
  alt: string;
};

/** Reference to a course category as embedded in course / project records. */
export type CategoryRef = {
  id: number;
  slug: string;
  name: string;
  badge: string;
};

export type Category = CategoryRef & {
  /** One-liner used on the home page category card. */
  summary: string;
  /** Sentence used under the heading on the courses overview page. */
  tagline: string;
  /** Long description used on the category landing hero. */
  description: string;
  /** Icon key (see `lib/category-icons.ts`). */
  icon: string;
  /** Title used in the footer "Categories" column. */
  footerLabel: string;
  /** Heading used on the courses overview page. */
  overviewTitle: string;
  courseCount: number;
};

export type SyllabusModule = {
  title: string;
  description: string;
};

export type CourseMeta = {
  duration: string;
  mode: string;
  admissions: string;
};

/** Card-level course data used by every listing. */
export type Course = {
  id: number;
  slug: string;
  title: string;
  /** Short badge label shown on featured cards (the category badge). */
  badge: string;
  /** One-line description used on cards. */
  description: string;
  /** e.g. "3 Months" */
  duration: string;
  durationWeeks: number;
  image: ImageAsset;
  /** Pinned to the home-page grid / category "Featured Programs" row. */
  featured: boolean;
  category: CategoryRef;
};

export type CourseDetail = Course & {
  detail: {
    heroTitle: string;
    heroDescription: string;
    meta: CourseMeta;
    overview: string;
    outcomes: string[];
    modules: SyllabusModule[];
    software: string[];
    whoShouldJoin: string;
    eligibility: string;
    careers: string[];
  };
  seo: { title: string; description: string };
  related: Course[];
};

export type Trainer = {
  id: number;
  name: string;
  role: string;
  /** Role label used on the compact home-page card. */
  homeRole: string | null;
  /** "Specialization: …" line on the home-page card. */
  specialization: string | null;
  bio: string;
  experience: string;
  tags: string[];
  image: ImageAsset;
  linkedin: string | null;
  showOnHome: boolean;
};

export type Project = {
  id: number;
  title: string;
  description: string;
  software: string[];
  image: ImageAsset;
  showOnHome: boolean;
  category: CategoryRef;
};

export type Testimonial = {
  id: number;
  quote: string;
  name: string;
  program: string;
  rating: number;
  avatar: ImageAsset;
};

export type FaqCategory = {
  id: number;
  slug: string;
  label: string;
};

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  showOnHome: boolean;
  category: FaqCategory;
  /** Expanded by default on the FAQ page. */
  defaultOpen?: boolean;
};

export type SiteSettings = {
  name: string;
  contact: {
    phone: string;
    phoneHref: string;
    whatsapp: string | null;
    whatsappHref: string | null;
    email: string;
    address: string;
    hours: string | null;
  };
  social: {
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    youtube: string | null;
  };
  gaMeasurementId: string | null;
};

export type PageMeta = {
  path: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type JourneyStep = {
  step: string;
  title: string;
  description: string;
};
