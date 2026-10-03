/**
 * Questions shown at the foot of a course page (and published as FAQPage
 * structured data for that page).
 *
 * Two sources, so nothing here can contradict the course record:
 *  - batch facts (duration, classroom / online) are written from the course
 *    data the admin console manages, for every course including future ones;
 *  - `subjectFaqs` adds answers about the subject for the courses we know,
 *    written against the syllabus published for each one. They make no claims
 *    about fees, placements or outcomes; if a syllabus is reworked in the admin
 *    console, re-read the matching entry. A course without an entry simply
 *    shows fewer questions.
 */
import type { CourseDetail, SiteSettings } from "@/types";

export type CourseFaq = { id: number; question: string; answer: string };

type Answer = { question: string; answer: string };

const subjectFaqs: Record<string, Answer[]> = {
  "revit-architecture": [
    {
      question: "Is Revit Architecture only for architects?",
      answer:
        "No. Revit Architecture is used by anyone who models a building and produces drawings from that model: architects, civil engineers working on building design and documentation, and architectural draughtspersons. Students of architecture or civil engineering can start with it too.",
    },
    {
      question: "Do I need to learn AutoCAD before Revit Architecture?",
      answer:
        "No. Revit works differently from AutoCAD: you build one 3D model and the plans, sections, elevations and schedules are generated from it. AutoCAD knowledge helps when you link DWG drawings into a project, which the course covers, but it is not a prerequisite.",
    },
  ],
  "revit-structure": [
    {
      question: "Is Revit Structure used for structural analysis?",
      answer:
        "Revit Structure is mainly a modeling, detailing and documentation tool. It maintains an analytical model alongside the physical one, and the course teaches how that model supports an analysis workflow, but the analysis and design calculations themselves are carried out in dedicated analysis software.",
    },
    {
      question: "Can Revit Structure produce bar bending schedules?",
      answer:
        "Yes. Reinforcement modeled in Revit carries bar marks, shapes, lengths and quantities, and these are scheduled to prepare bar-bending-schedule information. The course covers rebar for beams, slabs, columns and footings and the schedules built from it.",
    },
  ],
  "revit-mep": [
    {
      question: "Which MEP disciplines does the Revit MEP course cover?",
      answer:
        "All four building-services disciplines: mechanical (HVAC), electrical, plumbing and fire protection. Each is taught as its own part of the course, followed by a shared part on linking, worksharing, clash review and documentation.",
    },
    {
      question: "Is Revit MEP useful for HVAC engineers?",
      answer:
        "Yes. The mechanical part of the course covers HVAC equipment and plantrooms, duct and hydronic piping systems, ventilation and exhaust, duct and pipe sizing workflows, VRF/VRV systems and HVAC shop drawings, which is the day-to-day work of an HVAC BIM modeler.",
    },
  ],
  "navisworks-coordination": [
    {
      question: "What is clash detection in Navisworks?",
      answer:
        "Clash detection is an automated check for places where elements from different models occupy the same space or sit too close together, for example a duct passing through a beam. In Navisworks Manage you combine the discipline models, choose which systems to test against each other, run the tests, and then review, group and report the results so that each clash can be assigned and resolved.",
    },
    {
      question: "Do I need to know Revit before learning Navisworks?",
      answer:
        "It is recommended. Navisworks reviews and coordinates models that were built in authoring tools such as Revit, so basic BIM or Revit modeling knowledge and the ability to read construction drawings make the course much easier to follow.",
    },
  ],
};

/** "2 Months" → "2 months", with the week count the record carries. */
function durationPhrase(course: CourseDetail): string {
  const weeks = `${course.durationWeeks} week${course.durationWeeks === 1 ? "" : "s"}`;
  const label = course.duration.trim().toLowerCase();
  return label && !/week/.test(label) ? `${label} (${weeks})` : weeks;
}

/** Batch facts written from the course record; a mode we cannot read produces no question. */
function batchFaqs(course: CourseDetail, contact: SiteSettings["contact"]): Answer[] {
  const name = course.title;
  const mode = course.detail.meta.mode;
  const classroom = /offline|classroom|lab\b|on-?site|in-?person/i.test(mode);
  const online = /online|remote|virtual/i.test(mode.replace(/offline/gi, ""));
  const faqs: Answer[] = [
    {
      question: `How long is the ${name} course?`,
      answer: `The ${name} course runs for ${durationPhrase(course)}. The syllabus on this page lists what is covered, and you can download it as a PDF.`,
    },
  ];
  if (classroom && online) {
    faqs.push({
      question: `Is the ${name} course available online?`,
      answer: `Yes. The course runs as classroom batches at our centre at ${contact.address}, and as live online batches that follow the same syllabus.`,
    });
  } else if (online) {
    faqs.push({
      question: `Is the ${name} course available online?`,
      answer: "Yes. The course is taught in live online batches.",
    });
  } else if (classroom) {
    faqs.push({
      question: `Is the ${name} course available online?`,
      answer: `The course is currently taught in classroom batches at our centre at ${contact.address}. Contact the admissions team to ask about online options.`,
    });
  }
  return faqs;
}

export function getCourseFaqs(course: CourseDetail, contact: SiteSettings["contact"]): CourseFaq[] {
  return [...batchFaqs(course, contact), ...(subjectFaqs[course.slug] ?? [])].map((faq, id) => ({ id, ...faq }));
}
