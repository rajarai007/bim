import {
  Activity,
  Award,
  Briefcase,
  Compass,
  Layers,
  Monitor,
  MousePointer,
  Shield,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import type { Feature, JourneyStep } from "@/types";

export const softwareList = [
  "AutoCAD",
  "Revit",
  "Navisworks",
  "STAAD.Pro",
  "ETABS",
  "SAFE",
  "Tekla",
  "SketchUp",
  "3ds Max",
  "Enscape",
  "V-Ray",
  "Lumion",
  "Photoshop",
] as const;

export const whyChooseUs: Feature[] = [
  {
    id: "industry-relevant",
    title: "Industry-Relevant Training",
    description:
      "Syllabus tuned specifically to active structural, mechanical, and visual demands of top AEC firms.",
    icon: Briefcase,
  },
  {
    id: "project-based",
    title: "Practical Project-Based Learning",
    description:
      "Work on real building assets, clash coordinates, and model structures from scratch.",
    icon: Activity,
  },
  {
    id: "experienced-trainers",
    title: "Experienced Trainers",
    description:
      "Guided by certified BIM managers, structural specialists, and visualization professionals.",
    icon: Award,
  },
  {
    id: "career-focused",
    title: "Career-Focused Courses",
    description:
      "Skill development aimed directly at high-demand professional roles in India and globally.",
    icon: TrendingUp,
  },
  {
    id: "hands-on",
    title: "Hands-On Software Training",
    description:
      "Learn by doing in fully-equipped laboratory systems with structured guidance.",
    icon: MousePointer,
  },
  {
    id: "professional-environment",
    title: "Professional Environment",
    description:
      "Highly collaborative offline classroom system designed to mirror physical engineering offices.",
    icon: Shield,
  },
];

export const institutionalStrengths: Feature[] = [
  {
    id: "expert-trainers",
    title: "Expert Trainers",
    description:
      "AEC veteran engineers with decade-long architectural detailing expertise.",
    icon: User,
  },
  {
    id: "industry-curriculum",
    title: "Industry Curriculum",
    description:
      "Syllabus aligned with exact engineering consulting requirements.",
    icon: Layers,
  },
  {
    id: "project-learning",
    title: "Project-Based Learning",
    description: "Work on true multi-tier structural projects and models.",
    icon: Activity,
  },
  {
    id: "career-guidance",
    title: "Career Guidance",
    description:
      "Mock testing, CV optimization, and model portfolio generation.",
    icon: Compass,
  },
  {
    id: "modern-infrastructure",
    title: "Modern Infrastructure",
    description:
      "Advanced graphics computing workstations in premium laboratory.",
    icon: Monitor,
  },
  {
    id: "small-batches",
    title: "Small Batch Sizes",
    description:
      "Dedicated student attention ensuring personalized skill progression.",
    icon: Users,
  },
];

export const careerJourney: JourneyStep[] = [
  {
    step: "01",
    title: "Learn",
    description:
      "Structured conceptual foundation covering BIM guidelines & structural codes.",
  },
  {
    step: "02",
    title: "Practice",
    description:
      "Intense offline laboratory sessions working on design coordination software.",
  },
  {
    step: "03",
    title: "Build Skills",
    description:
      "Complete realistic AEC workflows, model detailing, and rendering runs.",
  },
  {
    step: "04",
    title: "Career Ready",
    description:
      "Walk away with technical expertise, a comprehensive model portfolio, and clear competence.",
  },
];

export const aboutBullets = [
  "Project-Based Offline Classrooms",
  "Certified Trainers with Decades of Site Experience",
  "Advanced BIM Lab Infrastructure",
] as const;

export const philosophyPoints = [
  "Parametric Structural Validation",
  "Interference Checks & Resolution Routing",
  "Dynamic Lighting & Architectural Rendering Cycles",
] as const;
