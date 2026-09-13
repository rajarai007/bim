import type {
  AdminRole,
  CategoryStatus,
  CourseStatus,
  EnquirySource,
  EnquiryStatus,
  FaqStatus,
  ProjectStatus,
  SyllabusModule,
  TestimonialStatus,
  TrainerStatus,
} from "../types";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PasswordResetToken = {
  id: number;
  adminUserId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  badge: string;
  summary: string;
  tagline: string;
  description: string;
  icon: string;
  footerLabel: string;
  overviewTitle: string;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  /** Populated by list queries. */
  courseCount?: number;
};

export type Course = {
  id: number;
  categoryId: number;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string | null;
  eligibility: string | null;
  whoShouldJoin: string | null;
  outcomes: string[];
  syllabus: SyllabusModule[];
  software: string[];
  careers: string[];
  durationWeeks: number;
  trainingMode: string;
  batchLocation: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  status: CourseStatus;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  /** Joined from categories. */
  categorySlug: string;
  categoryName: string;
  categoryBadge: string;
};

export type Trainer = {
  id: number;
  name: string;
  role: string;
  homeRole: string | null;
  specialization: string | null;
  bio: string;
  experienceYears: number;
  tags: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  linkedinUrl: string | null;
  showOnHome: boolean;
  status: TrainerStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Testimonial = {
  id: number;
  name: string;
  program: string;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  status: TestimonialStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Project = {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  software: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  showOnHome: boolean;
  status: ProjectStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  categorySlug: string;
  categoryName: string;
  categoryBadge: string;
};

export type FaqCategory = { id: number; slug: string; label: string; sortOrder: number };

export type Faq = {
  id: number;
  faqCategoryId: number;
  question: string;
  answer: string;
  showOnHome: boolean;
  status: FaqStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  categorySlug: string;
  categoryLabel: string;
};

export type Enquiry = {
  id: number;
  fullName: string;
  mobile: string;
  email: string | null;
  courseId: number | null;
  courseName: string | null;
  qualification: string | null;
  experienceLevel: string | null;
  message: string | null;
  consent: boolean;
  source: EnquirySource;
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  /** Latest admin note, joined in list queries. */
  latestNote: EnquiryNote | null;
};

export type EnquiryNote = {
  id: number;
  enquiryId: number;
  adminUserId: number | null;
  adminName: string | null;
  note: string;
  createdAt: Date;
};

export type SiteSettings = {
  academyName: string;
  address: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  workingHours: string | null;
  logoUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  webhookUrl: string | null;
  gaMeasurementId: string | null;
  updatedAt: Date;
};

export type SitePage = {
  id: number;
  path: string;
  title: string;
  sectionCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  sortOrder: number;
  updatedAt: Date;
};

export type Media = {
  id: number;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: number | null;
  createdAt: Date;
  /** Number of catalogue records that reference this file (list queries). */
  usageCount?: number;
};
