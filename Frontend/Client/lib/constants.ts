/** Central route map so links never hardcode paths. */
export const routes = {
  home: "/",
  about: "/about",
  courses: "/courses",
  category: (category: string) => `/courses/${category}`,
  course: (category: string, slug: string) => `/courses/${category}/${slug}`,
  whyChooseUs: "/#why-choose-us",
  trainers: "/trainers",
  projects: "/projects",
  testimonials: "/#testimonials",
  contact: "/contact",
  faq: "/faq",
  privacy: "/privacy-policy",
} as const;

export const navItems = [
  { label: "Home", href: routes.home },
  { label: "About", href: routes.about },
  { label: "Courses", href: routes.courses },
  { label: "Why Choose Us", href: routes.whyChooseUs },
  { label: "Trainers", href: routes.trainers },
  { label: "Projects", href: routes.projects },
  { label: "Testimonials", href: routes.testimonials },
  { label: "Contact", href: routes.contact },
] as const;
