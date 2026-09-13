import {
  BookOpen,
  Briefcase,
  FileText,
  HelpCircle,
  Image,
  Inbox,
  LayoutGrid,
  Layers,
  MessageSquare,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export const routes = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  profile: "/profile",
  dashboard: "/",
  courses: "/courses",
  courseNew: "/courses/new",
  courseEdit: (id: string) => `/courses/${id}/edit`,
  categories: "/categories",
  enquiries: "/enquiries",
  trainers: "/trainers",
  testimonials: "/testimonials",
  projects: "/projects",
  faqs: "/faqs",
  content: "/content",
  media: "/media",
  seo: "/seo",
  settings: "/settings",
} as const;

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** Sidebar navigation, in design order. */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: routes.dashboard, icon: LayoutGrid },
  { label: "Courses", href: routes.courses, icon: BookOpen },
  { label: "Categories", href: routes.categories, icon: Layers },
  { label: "Enquiries", href: routes.enquiries, icon: Inbox },
  { label: "Trainers", href: routes.trainers, icon: Users },
  { label: "Testimonials", href: routes.testimonials, icon: MessageSquare },
  { label: "Projects", href: routes.projects, icon: Briefcase },
  { label: "FAQs", href: routes.faqs, icon: HelpCircle },
  { label: "Content", href: routes.content, icon: FileText },
  { label: "Media", href: routes.media, icon: Image },
  { label: "SEO", href: routes.seo, icon: Search },
  { label: "Settings", href: routes.settings, icon: Settings },
];

export const SESSION_COOKIE = "bim_admin_session";
