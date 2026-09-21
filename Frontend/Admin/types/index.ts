export type Tone = "primary" | "teal" | "success" | "info" | "warning" | "danger" | "muted";

export type Pagination = { page: number; pageSize: number; total: number; totalPages: number };
export type Paginated<T> = { items: T[]; pagination: Pagination };

/* ------------------------------------------------------------- courses */
export type CourseStatus = "active" | "draft" | "inactive";

export type SyllabusModule = { title: string; description: string };

export type AdminCourse = {
  id: number;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  categoryBadge: string;
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
  /** "12 Weeks" */
  duration: string;
  /** "12 Weeks (3 Months)" */
  durationOption: string;
  trainingMode: string;
  batchLocation: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  /** Downloadable syllabus PDF (media URL) or null. */
  syllabusUrl: string | null;
  status: CourseStatus;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/* ----------------------------------------------------------- catalogue */
export type CategoryRecord = {
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
  status: "active" | "inactive";
  sortOrder: number;
  courseCount: number;
};

export type TrainerRecord = {
  id: number;
  name: string;
  role: string;
  homeRole: string | null;
  specialization: string | null;
  bio: string;
  experienceYears: number;
  /** "12+ Years" */
  experience: string;
  tags: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  linkedinUrl: string | null;
  showOnHome: boolean;
  status: "active" | "inactive";
};

export type TestimonialRecord = {
  id: number;
  name: string;
  program: string;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  status: "published" | "pending";
};

export type ProjectRecord = {
  id: number;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  categoryBadge: string;
  title: string;
  description: string;
  software: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  showOnHome: boolean;
  status: "published" | "draft";
};

export type FaqCategory = { id: number; slug: string; label: string };

export type FaqRecord = {
  id: number;
  faqCategoryId: number;
  categorySlug: string;
  categoryLabel: string;
  question: string;
  answer: string;
  showOnHome: boolean;
  status: "published" | "draft";
};

/* ----------------------------------------------------------- enquiries */
export type LeadStatus = "new" | "contacted" | "follow-up" | "converted" | "lost";

export type LeadNote = {
  id: number;
  enquiryId: number;
  adminUserId: number | null;
  adminName: string | null;
  note: string;
  createdAt: string;
};

export type Lead = {
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
  source: "contact_form" | "course_page";
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  latestNote: LeadNote | null;
};

export type LeadStats = { total: number; new: number; inProgress: number; converted: number; lost: number };

/* ----------------------------------------------------------- dashboard */
export type StatCard = {
  id: string;
  label: string;
  value: string;
  caption?: string;
  delta?: { label: string; tone: "success" | "primary" };
  dot: Tone;
  /** Normalised 0..1 series for the sparkline (1 = top). */
  trend?: number[];
};

export type TrendPoint = { label: string; value: number };

export type DonutSlice = { label: string; percent: number; tone: Tone };

export type DashboardData = {
  stats: StatCard[];
  trend: TrendPoint[];
  byCategory: DonutSlice[];
  byCategoryTotal: string;
  recentEnquiries: Lead[];
};

/* ------------------------------------------------------------ settings */
export type AcademySettings = {
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
  updatedAt: string;
};

export type SitePage = {
  id: number;
  path: string;
  title: string;
  sectionCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
};

export type MediaItem = {
  id: number;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  usageCount: number;
};

/** Result shape shared by every form server action. */
export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
} | undefined;
