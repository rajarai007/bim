/**
 * Seed content — the catalogue extracted from the Figma design. Image paths are
 * relative to the API origin and served from `assets/images`.
 */
export type SeedCategory = {
  slug: string;
  name: string;
  badge: string;
  summary: string;
  tagline: string;
  description: string;
  icon: string;
  footerLabel: string;
  overviewTitle: string;
};

export const categories: SeedCategory[] = [
  {
    slug: "bim-digital-construction",
    name: "BIM & Digital Construction",
    badge: "BIM",
    summary: "Master BIM processes including Revit, Navisworks, BIM 360 & execution planning.",
    tagline: "Master cutting-edge BIM technologies and digital construction workflows",
    description:
      "Master cutting-edge BIM technologies including Revit, Navisworks, BIM 360, Dynamo and more. Our comprehensive BIM training prepares you for real-world digital construction projects.",
    icon: "box",
    footerLabel: "BIM & Digital Construction",
    overviewTitle: "BIM & Digital Construction",
  },
  {
    slug: "structural-design",
    name: "Structural Design",
    badge: "Structural",
    summary: "Deep dive into structural modeling and analysis with STAAD.Pro, ETABS, and Tekla.",
    tagline: "Comprehensive structural engineering and design software training",
    description:
      "Build expertise in structural analysis and design with STAAD.Pro, ETABS, SAFE and Tekla. Learn frame validation, seismic checks and fabrication-ready detailing on real building assets.",
    icon: "activity",
    footerLabel: "Structural Engineering",
    overviewTitle: "Structural Design",
  },
  {
    slug: "mep-design",
    name: "MEP Design & Drafting",
    badge: "MEP",
    summary: "Analyze mechanical HVAC, electrical routing, plumbing systems, and firefighting layouts.",
    tagline: "HVAC, electrical, plumbing and fire fighting design mastery",
    description:
      "Design and coordinate mechanical, electrical, plumbing and fire-fighting systems with Revit MEP and AutoCAD. Learn sizing, routing and clash-free coordination for modern buildings.",
    icon: "wind",
    footerLabel: "MEP System Design",
    overviewTitle: "MEP Design",
  },
  {
    slug: "interior-design-software",
    name: "Interior Design Software",
    badge: "Interior",
    summary: "Build stellar photo-realistic rendering capabilities with SketchUp, 3ds Max, V-Ray, and Lumion.",
    tagline: "Interior visualization, rendering and design software training",
    description:
      "Create photo-realistic interior visualizations with SketchUp, 3ds Max, V-Ray, Lumion and Enscape. Learn lighting, materials and presentation-ready rendering workflows.",
    icon: "home",
    footerLabel: "Interior Visualization",
    overviewTitle: "Interior Design Software",
  },
];

const img = {
  revitArchitecture: "/images/course-revit-architecture.png",
  staadPro: "/images/course-staad-pro.png",
  revitMep: "/images/course-revit-mep.png",
  threeDsMax: "/images/course-3ds-max.png",
  navisworks: "/images/course-navisworks.png",
  autocad: "/images/course-autocad.png",
  bimSection: "/images/project-bim-section.png",
  parametric: "/images/project-parametric-structure.png",
  commercialComplex: "/images/project-commercial-complex.png",
  luxuryLounge: "/images/project-luxury-lounge.png",
} as const;

export type SeedCourse = {
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  durationWeeks: number;
  imageUrl: string;
  imageAlt: string;
  featured?: boolean;
  status?: "active" | "draft" | "inactive";
  eligibility?: string;
  whoShouldJoin?: string;
  outcomes?: string[];
  syllabus?: { title: string; description: string }[];
  software?: string[];
  careers?: string[];
  trainingMode?: string;
  batchLocation?: string;
  metaTitle?: string;
  metaDescription?: string;
};

const defaultEligibility =
  "Basic technical drawing knowledge, architectural/construction core interest, and computer operations competence.";
const defaultWhoShouldJoin =
  "Civil Engineers, Architects, Interior Designers, BIM Drafters, and students pursuing these engineering pathways.";

export const courses: SeedCourse[] = [
  /* ------------------------------------------------------------------ BIM */
  {
    slug: "bim-fundamentals",
    category: "bim-digital-construction",
    title: "BIM Fundamentals",
    shortDescription: "Core principles of Building Information Modeling, LOD specifications, and BEP standards.",
    durationWeeks: 4,
    imageUrl: img.revitArchitecture,
    imageAlt: "Revit Architecture wireframe model on a workstation",
  },
  {
    slug: "autocad-drafting",
    category: "bim-digital-construction",
    title: "Advanced AutoCAD 2D/3D",
    shortDescription: "Produce standardized blueprints, technical details, annotations, and professional layout designs.",
    durationWeeks: 8,
    imageUrl: img.autocad,
    imageAlt: "AutoCAD technical drawings on a monitor",
    featured: true,
    software: ["AutoCAD 2D", "AutoCAD 3D"],
    careers: ["CAD Drafter", "Architectural Draftsman", "Design Technician"],
  },
  {
    slug: "revit-architecture",
    category: "bim-digital-construction",
    title: "Revit Architecture (Mastery)",
    shortDescription:
      "Develop premium architectural modeling skills, build custom parameters, worksharing systems, and capstone BIM projects.",
    fullDescription:
      "Master Autodesk Revit Architecture from basics to advanced BIM modeling. Learn to create detailed 3D building models, generate construction documents, and collaborate on BIM projects using industry-standard workflows. Revit Architecture serves as the technological anchor for digital modeling globally. This program equips structural architects and engineers to establish detailed parametric assets, run cloud-synchronized project structures, and handle precise sheet schedules conforming to global levels of development.",
    durationWeeks: 12,
    imageUrl: img.revitArchitecture,
    imageAlt: "Revit Architecture wireframe model on a workstation",
    featured: true,
    eligibility: defaultEligibility,
    whoShouldJoin: defaultWhoShouldJoin,
    outcomes: [
      "3D Building Modeling & Parametric Setup",
      "Standard Floor Plans, Elevations & Sections",
      "Advanced Detail Views & Drafting Rules",
      "Revit Family Creation (Parametric components)",
      "Sheet Setup, Annotations & Technical Prints",
      "Rendering, Photographic Lighting & Materials",
      "Cloud Collaboration & Project Worksharing",
      "BIM Execution Standards & Best Practices",
    ],
    syllabus: [
      {
        title: "Module 1: Introduction to BIM & Revit Interface",
        description:
          "Understanding LOD levels, standard coordinate grids, starting structural models, and basic tool manipulation.",
      },
      {
        title: "Module 2: Building Elements & Structural Modeling",
        description:
          "Establishing wall structures, concrete slabs, doors, parametric window families, stairs, and roofing groups.",
      },
      {
        title: "Module 3: Advanced Parametric Family Creation",
        description:
          "Formulating geometric variables, parameters, nested structural components, and cataloging custom architectural elements.",
      },
      {
        title: "Module 4: Technical Sheets & Documentation Cycles",
        description:
          "Schedules generation, automated structural specifications, drafting details, elevations, and blueprint print setups.",
      },
      {
        title: "Module 5: Collaboration, Worksharing & Cloud Setup",
        description:
          "Revit central files setup, multi-user structural sync, tracking model coordination, and project lifecycle management.",
      },
      {
        title: "Module 6: Capstone Project & Portfolio Execution",
        description:
          "Complete modeling of a multi-tier commercial building asset, running interference checks, and visual renders.",
      },
    ],
    software: ["Autodesk Revit", "Navisworks Manage", "AutoCAD 2D"],
    careers: ["BIM Modeler", "Revit Specialist", "BIM Coordinator", "Architectural Drafter", "Design Modeler"],
    trainingMode: "Offline & Online",
    batchLocation: "Okhla Center",
    metaTitle: "Revit Architecture Mastery Course | BIM Career Academy",
    metaDescription:
      "Master Autodesk Revit Architecture from basics to advanced BIM modeling with hands-on offline & online training in New Delhi.",
  },
  {
    slug: "revit-structure",
    category: "bim-digital-construction",
    title: "Revit Structure",
    shortDescription:
      "Reinforced concrete and steel modeling, reinforcement detailing, and structural design coordination.",
    durationWeeks: 12,
    imageUrl: img.staadPro,
    imageAlt: "STAAD.Pro structural analysis stress diagram",
  },
  {
    slug: "revit-mep",
    category: "bim-digital-construction",
    title: "Revit MEP",
    shortDescription: "MEP services modeling, mechanical ducts, pipe networks, and cable trays coordination.",
    durationWeeks: 12,
    imageUrl: img.revitMep,
    imageAlt: "Coordinated Revit MEP services model",
  },
  {
    slug: "navisworks-coordination",
    category: "bim-digital-construction",
    title: "BIM Coordination & Navisworks",
    shortDescription:
      "Run comprehensive interference detection, manage audit schedules, and direct construction logistics.",
    durationWeeks: 8,
    imageUrl: img.navisworks,
    imageAlt: "Navisworks clash detection on a large monitor",
    featured: true,
    software: ["Navisworks Manage", "Autodesk Revit"],
    careers: ["BIM Coordinator", "Clash Detection Engineer"],
  },
  {
    slug: "bim-coordination-setup",
    category: "bim-digital-construction",
    title: "BIM Coordination & Setup",
    shortDescription:
      "Coordinate multi-disciplinary models, set standards, develop execution plans, and resolve clashes with modern workflow guidelines.",
    durationWeeks: 16,
    imageUrl: img.bimSection,
    imageAlt: "Sectioned BIM model with annotated building systems",
  },
  {
    slug: "bim-360-collaboration",
    category: "bim-digital-construction",
    title: "BIM 360 & Collaboration",
    shortDescription: "Cloud coordination, model collaboration, markup setups, and team workflow management.",
    durationWeeks: 6,
    imageUrl: img.revitArchitecture,
    imageAlt: "Revit Architecture wireframe model on a workstation",
  },
  {
    slug: "autodesk-construction-cloud",
    category: "bim-digital-construction",
    title: "Autodesk Construction Cloud",
    shortDescription: "Modern ACC unified platform workflow, asset tracking, and quality control systems.",
    durationWeeks: 8,
    imageUrl: img.bimSection,
    imageAlt: "Sectioned BIM model with annotated building systems",
  },
  {
    slug: "dynamo-for-revit",
    category: "bim-digital-construction",
    title: "Dynamo for Revit",
    shortDescription:
      "Visual programming, parameter automation, computational geometry and custom script runs.",
    durationWeeks: 8,
    imageUrl: img.staadPro,
    imageAlt: "STAAD.Pro structural analysis stress diagram",
  },
  {
    slug: "diroots-automation",
    category: "bim-digital-construction",
    title: "DiRoots Automation",
    shortDescription:
      "Utilizing DiRoots tools for rapid parameter editing, sheets generation, and coordinate export.",
    durationWeeks: 4,
    imageUrl: img.autocad,
    imageAlt: "AutoCAD technical drawings on a monitor",
  },
  {
    slug: "bim-management",
    category: "bim-digital-construction",
    title: "BIM Management",
    shortDescription: "Drafting BEP guidelines, establishing protocols, and audit management.",
    durationWeeks: 12,
    imageUrl: img.bimSection,
    imageAlt: "Sectioned BIM model with annotated building systems",
  },
  {
    slug: "clash-detection-routine",
    category: "bim-digital-construction",
    title: "Clash Detection Routine",
    shortDescription:
      "Structuring standard rules for automated interference analysis and correction cycles.",
    durationWeeks: 4,
    imageUrl: img.bimSection,
    imageAlt: "Sectioned BIM model with annotated building systems",
  },
  {
    slug: "4d-5d-bim-simulation",
    category: "bim-digital-construction",
    title: "4D & 5D BIM Simulation",
    shortDescription: "Integrating schedule timelines and cost calculation into coordinated models.",
    durationWeeks: 8,
    imageUrl: img.parametric,
    imageAlt: "Parametric structural model on a workstation",
  },
  {
    slug: "scan-to-bim-modeling",
    category: "bim-digital-construction",
    title: "Scan to BIM Modeling",
    shortDescription: "Converting point cloud data into accurate parametric building assets.",
    durationWeeks: 10,
    imageUrl: img.parametric,
    imageAlt: "Parametric structural model on a workstation",
  },
  {
    slug: "bim-documentation",
    category: "bim-digital-construction",
    title: "BIM Documentation",
    shortDescription: "Standard sheets generation, annotation rules, and code compliance mapping.",
    durationWeeks: 6,
    imageUrl: img.autocad,
    imageAlt: "AutoCAD technical drawings on a monitor",
  },

  /* ----------------------------------------------------------- Structural */
  {
    slug: "autocad-civil",
    category: "structural-design",
    title: "AutoCAD Civil",
    shortDescription: "Civil structural detailing, standard layouts and documentation rules.",
    durationWeeks: 8,
    imageUrl: img.autocad,
    imageAlt: "AutoCAD technical drawings on a monitor",
  },
  {
    slug: "staad-pro",
    category: "structural-design",
    title: "STAAD.Pro (Structural Analysis)",
    shortDescription: "Design structural framing, execute analysis for wind, seismic, and static loading limits.",
    durationWeeks: 12,
    imageUrl: img.staadPro,
    imageAlt: "STAAD.Pro structural analysis stress diagram",
    featured: true,
    software: ["STAAD.Pro", "AutoCAD"],
    careers: ["Structural Designer", "Structural Analyst"],
  },
  {
    slug: "etabs-analysis",
    category: "structural-design",
    title: "ETABS Analysis",
    shortDescription: "Seismic validation, concrete building modeling and safety load limits.",
    durationWeeks: 8,
    imageUrl: img.staadPro,
    imageAlt: "STAAD.Pro structural analysis stress diagram",
  },
  {
    slug: "tekla-structures",
    category: "structural-design",
    title: "Tekla Structures",
    shortDescription: "Detailed structural modeling, steel detailing and fabrication maps.",
    durationWeeks: 12,
    imageUrl: img.parametric,
    imageAlt: "Parametric structural model on a workstation",
  },
  {
    slug: "rcc-design",
    category: "structural-design",
    title: "RCC Design",
    shortDescription: "Reinforced concrete design standards, detailing codes and site rules.",
    durationWeeks: 8,
    imageUrl: img.staadPro,
    imageAlt: "STAAD.Pro structural analysis stress diagram",
  },

  /* ------------------------------------------------------------------ MEP */
  {
    slug: "revit-mep-master",
    category: "mep-design",
    title: "Revit MEP & Drafting",
    shortDescription:
      "Establish MEP system plans, sizing formulas, and coordinated models matching modern guidelines.",
    durationWeeks: 12,
    imageUrl: img.revitMep,
    imageAlt: "Coordinated Revit MEP services model",
    featured: true,
    software: ["Revit MEP", "AutoCAD", "Navisworks"],
    careers: ["MEP Modeler", "HVAC Designer", "MEP Drafter"],
  },
  {
    slug: "hvac-design",
    category: "mep-design",
    title: "HVAC Design",
    shortDescription: "Heating, ventilation, air conditioning routing and calculations.",
    durationWeeks: 8,
    imageUrl: img.commercialComplex,
    imageAlt: "MEP coordination model of a commercial complex",
  },
  {
    slug: "electrical-design",
    category: "mep-design",
    title: "Electrical Design",
    shortDescription: "Power routing, lighting layout planning and wiring standard validation.",
    durationWeeks: 8,
    imageUrl: img.revitMep,
    imageAlt: "Coordinated Revit MEP services model",
  },
  {
    slug: "plumbing-drafting",
    category: "mep-design",
    title: "Plumbing Drafting",
    shortDescription: "Water supply planning, drainage layout and sanitation coordination.",
    durationWeeks: 6,
    imageUrl: img.commercialComplex,
    imageAlt: "MEP coordination model of a commercial complex",
  },
  {
    slug: "fire-fighting-design",
    category: "mep-design",
    title: "Fire Fighting Design",
    shortDescription: "Safety layouts, sprinkler distribution and structural code compliance.",
    durationWeeks: 6,
    imageUrl: img.revitMep,
    imageAlt: "Coordinated Revit MEP services model",
  },

  /* ------------------------------------------------------------- Interior */
  {
    slug: "autocad-interior",
    category: "interior-design-software",
    title: "AutoCAD Interior",
    shortDescription: "Interior floor planning, elevations, details and coordination maps.",
    durationWeeks: 6,
    imageUrl: img.autocad,
    imageAlt: "AutoCAD technical drawings on a monitor",
  },
  {
    slug: "sketchup-3d",
    category: "interior-design-software",
    title: "SketchUp 3D",
    shortDescription: "Rapid prototyping, customized structural design and space layout.",
    durationWeeks: 6,
    imageUrl: img.luxuryLounge,
    imageAlt: "Rendered luxury living lounge interior",
  },
  {
    slug: "3ds-max-master",
    category: "interior-design-software",
    title: "3ds Max & Architectural Render",
    shortDescription:
      "Generate premium material maps, dramatic photographic lighting environments, and VR simulations.",
    durationWeeks: 12,
    imageUrl: img.threeDsMax,
    imageAlt: "Photo-realistic interior render of a lounge",
    featured: true,
    software: ["3ds Max", "V-Ray", "Photoshop"],
    careers: ["Architectural Visualizer", "3D Artist", "Interior Visualizer"],
  },
  {
    slug: "v-ray-rendering",
    category: "interior-design-software",
    title: "V-Ray Rendering",
    shortDescription: "Photorealistic render loops, realistic reflections and presentation.",
    durationWeeks: 8,
    imageUrl: img.luxuryLounge,
    imageAlt: "Rendered luxury living lounge interior",
  },
];

export type SeedTrainer = {
  name: string;
  role: string;
  homeRole?: string;
  specialization?: string;
  bio: string;
  experienceYears: number;
  tags: string[];
  imageUrl: string;
  imageAlt: string;
  linkedinUrl: string;
  showOnHome?: boolean;
  status?: "active" | "inactive";
};

export const trainers: SeedTrainer[] = [
  {
    name: "Ar. Rajesh Kumar",
    role: "Senior BIM Consultant",
    homeRole: "Principal BIM Architect",
    specialization: "Revit Master & BIM 360",
    bio: "Ex-BIM Manager at top global AEC consultancy. Expert in Level of Development (LOD) and clash detection workflows.",
    experienceYears: 12,
    tags: ["Revit", "Navisworks", "BIM 360"],
    imageUrl: "/images/person-01.png",
    imageAlt: "Ar. Rajesh Kumar in the BIM lab",
    linkedinUrl: "https://linkedin.com",
    showOnHome: true,
  },
  {
    name: "Er. Priya Sharma",
    role: "Structural Design Lead",
    homeRole: "Senior Structural Consultant",
    specialization: "STAAD.Pro & ETABS Expert",
    bio: "Leading consultant for high-rise residential projects. Focused on advanced finite element analysis and structural safety.",
    experienceYears: 10,
    tags: ["STAAD.Pro", "ETABS", "Tekla"],
    imageUrl: "/images/person-02.png",
    imageAlt: "Er. Priya Sharma at the academy",
    linkedinUrl: "https://linkedin.com",
    showOnHome: true,
  },
  {
    name: "Er. Amit Verma",
    role: "MEP Design Specialist",
    homeRole: "MEP Systems Director",
    specialization: "HVAC & Firefighting Coordination",
    bio: "Specialist in HVAC and firefighting coordination system designs for massive industrial and commercial complexes.",
    experienceYears: 9,
    tags: ["Revit MEP", "AutoCAD", "Navisworks"],
    imageUrl: "/images/person-03.png",
    imageAlt: "Er. Amit Verma holding drawings",
    linkedinUrl: "https://linkedin.com",
    showOnHome: true,
  },
  {
    name: "Ar. Sneha Patel",
    role: "Interior Design Expert",
    homeRole: "Lead Architectural Visualizer",
    specialization: "3ds Max & V-Ray Specialist",
    bio: "Passionate about photographic architectural visualization. Teaches lighting design, material detailing, and high-fidelity rendering.",
    experienceYears: 8,
    tags: ["SketchUp", "3ds Max", "V-Ray"],
    imageUrl: "/images/person-04.png",
    imageAlt: "Ar. Sneha Patel at a workstation",
    linkedinUrl: "https://linkedin.com",
    showOnHome: true,
  },
  {
    name: "Er. Vikram Singh",
    role: "BIM Coordinator",
    bio: "Expert in automation within Revit using Dynamo scripting. Specializes in multi-disciplinary collaborative platforms.",
    experienceYears: 7,
    tags: ["BIM Execution Planning", "Revit", "Dynamo"],
    imageUrl: "/images/person-05.png",
    imageAlt: "Er. Vikram Singh",
    linkedinUrl: "https://linkedin.com",
  },
  {
    name: "Er. Neha Gupta",
    role: "HVAC Design Engineer",
    bio: "Focused on energy-efficient green building ventilation designs. Handled international client modeling layouts.",
    experienceYears: 6,
    tags: ["Revit MEP", "HAP", "Eluclidian Systems"],
    imageUrl: "/images/person-06.png",
    imageAlt: "Er. Neha Gupta",
    linkedinUrl: "https://linkedin.com",
  },
  {
    name: "Er. Arjun Mehta",
    role: "Revit Specialist",
    bio: "Parametric modeling virtuoso with intensive site coordination and structural model detailing history.",
    experienceYears: 8,
    tags: ["Revit Structure", "Revit Architecture"],
    imageUrl: "/images/person-07.png",
    imageAlt: "Er. Arjun Mehta",
    linkedinUrl: "https://linkedin.com",
  },
  {
    name: "Mr. Kavita Reddy",
    role: "Visualization Expert",
    bio: "Brings concepts to life with real-time immersive walkthrough packages and commercial presentation renders.",
    experienceYears: 11,
    tags: ["Lumion", "Photoshop", "3ds Max"],
    imageUrl: "/images/person-05.png",
    imageAlt: "Mr. Kavita Reddy",
    linkedinUrl: "https://linkedin.com",
  },
];

export type SeedTestimonial = {
  name: string;
  program: string;
  quote: string;
  rating: number;
  avatarUrl: string;
  status: "published" | "pending";
};

export const testimonials: SeedTestimonial[] = [
  {
    name: "Anjali Gupta",
    program: "Revit Architecture & BIM Mastery Graduate",
    quote:
      "BIM Career Academy changed the trajectory of my design capabilities. The offline & online practical approach made Navisworks coordination extremely clear. Highly recommended!",
    rating: 5,
    avatarUrl: "/images/person-05.png",
    status: "published",
  },
  {
    name: "Suresh Menon",
    program: "Structural Engineering Program",
    quote:
      "The trainers here speak from site experience. Studying STAAD.Pro and ETABS with Er. Amit Sharma saved me hours of trial and error in structural modeling.",
    rating: 5,
    avatarUrl: "/images/person-07.png",
    status: "published",
  },
  {
    name: "Pranav Dixit",
    program: "Advanced MEP Coordinated Drafting Course",
    quote:
      "Highly structured and technical atmosphere. Working on multi-tier building systems for MEP routing gave me solid confidence for office operations.",
    rating: 5,
    avatarUrl: "/images/person-06.png",
    status: "published",
  },
  {
    name: "Meera Iyer",
    program: "3ds Max & V-Ray Rendering",
    quote: "Lighting and material workflows finally clicked for me. The render lab sessions were worth every hour.",
    rating: 4,
    avatarUrl: "/images/person-04.png",
    status: "pending",
  },
];

export type SeedProject = {
  category: string;
  title: string;
  description: string;
  software: string[];
  imageUrl: string;
  imageAlt: string;
  showOnHome?: boolean;
  status?: "published" | "draft";
};

export const projects: SeedProject[] = [
  {
    category: "bim-digital-construction",
    title: "Commercial Tower BIM Model",
    description: "LOD 400 highly coordinated digital construction model with automated clash reports.",
    software: ["Revit", "Navisworks", "BIM 360"],
    imageUrl: img.bimSection,
    imageAlt: "Sectioned commercial tower BIM model",
    showOnHome: true,
  },
  {
    category: "structural-design",
    title: "Residential Complex Analysis",
    description: "Comprehensive structural modeling and earthquake load static distribution.",
    software: ["STAAD.Pro", "ETABS", "SAFE"],
    imageUrl: img.commercialComplex,
    imageAlt: "Structural analysis model of a residential complex",
    showOnHome: true,
  },
  {
    category: "mep-design",
    title: "Hospital MEP Coordination",
    description: "Complex coordination of medical oxygen lines, HVAC, and fire fighting safety grids.",
    software: ["Revit MEP", "Navisworks"],
    imageUrl: img.parametric,
    imageAlt: "Coordinated MEP model on a workstation",
    showOnHome: true,
  },
  {
    category: "interior-design-software",
    title: "Luxury Villa Interior Visual",
    description: "Stunning photo-realistic visualization rendering with physical lighting calculations.",
    software: ["3ds Max", "V-Ray", "Photoshop"],
    imageUrl: img.luxuryLounge,
    imageAlt: "Photo-realistic render of a luxury villa lounge",
    showOnHome: true,
  },
  {
    category: "bim-digital-construction",
    title: "Metro Station BIM Detailing",
    description: "Multi-disciplinary model detailing and standardized construction schedules.",
    software: ["Revit", "Navisworks"],
    imageUrl: img.bimSection,
    imageAlt: "Detailed metro station BIM model",
  },
  {
    category: "structural-design",
    title: "Industrial Warehouse Steel",
    description: "Detailing steel structural designs matching strict international fabrication standards.",
    software: ["Tekla Structures", "STAAD.Pro"],
    imageUrl: img.commercialComplex,
    imageAlt: "Steel structure model of an industrial warehouse",
  },
  {
    category: "mep-design",
    title: "Office Building HVAC Layout",
    description: "Coordinated mechanical ducts, cooling tower placements, and electrical runs.",
    software: ["AutoCAD", "Revit MEP"],
    imageUrl: img.parametric,
    imageAlt: "HVAC layout for an office building",
  },
  {
    category: "interior-design-software",
    title: "Boutique Hotel Render",
    description: "Interactive VR visual walkthrough rendering showing material maps and day cycle.",
    software: ["3ds Max", "Lumion", "Enscape"],
    imageUrl: img.luxuryLounge,
    imageAlt: "Rendered boutique hotel interior",
  },
];

export const faqCategories = [
  { slug: "general", label: "General Queries" },
  { slug: "curriculum", label: "Course Curriculums" },
  { slug: "practicalities", label: "Training Practicalities" },
  { slug: "enrollment", label: "Enrollment & Fees" },
  { slug: "certifications", label: "Certifications" },
];

export type SeedFaq = {
  category: string;
  question: string;
  answer: string;
  showOnHome?: boolean;
  status?: "published" | "draft";
};

export const faqs: SeedFaq[] = [
  {
    category: "general",
    question: "What courses does BIM Career Academy offer?",
    answer:
      "We offer specialized classroom-intensive courses in BIM & Digital Construction (Revit, Navisworks, BIM 360), Structural Analysis & Design (STAAD.Pro, ETABS, Tekla), MEP Design & Drafting, and high-fidelity Interior Design Software (3ds Max, V-Ray, Lumion). Both individual tools and integrated hybrid packages are available.",
  },
  {
    category: "general",
    question: "Is the training online or offline?",
    answer:
      "Both. We run offline batches in our advanced workstation lab at Okhla, New Delhi, and live online batches for students who cannot attend in person. Either way the training is hands-on: you work on real-world engineering coordination files, mirror actual architectural office interactions, and prepare for industry tests.",
  },
  {
    category: "general",
    question: "What is the duration of courses?",
    answer:
      "Individual software mastery modules typically span 4 to 6 weeks. Integrated comprehensive programs (like the Master BIM Coordination Package) run between 3 to 6 months depending on student background and selected specialization paths.",
  },
  {
    category: "general",
    question: "Do I need prior experience to join?",
    answer:
      "No prior software experience is required. Civil Engineers, Architects, Interior Designers, MEP technicians, and students currently pursuing these branches are best suited, and every program starts with foundational modules.",
  },
  {
    category: "curriculum",
    question: "What software will I learn?",
    answer:
      "Depending on your track you will work with AutoCAD, Revit, Navisworks, STAAD.Pro, ETABS, SAFE, Tekla, SketchUp, 3ds Max, Enscape, V-Ray, Lumion and Photoshop inside our workstation lab.",
  },
  {
    category: "curriculum",
    question: "Who are the trainers?",
    answer:
      "Our trainers are certified BIM managers, structural specialists, MEP directors and visualization professionals with decade-long site and consulting experience.",
  },
  {
    category: "practicalities",
    question: "What is the batch size?",
    answer:
      "Batches are intentionally small so that every student receives dedicated workstation time and personal attention throughout the program.",
  },
  {
    category: "certifications",
    question: "Do you provide certification?",
    answer:
      "Yes. Every completed program includes a BIM Career Academy course-completion certificate along with a reviewed model portfolio you can present to employers.",
  },
  {
    category: "general",
    question: "What are the career opportunities after training?",
    answer:
      "Graduates move into roles such as BIM Modeler, Revit Specialist, BIM Coordinator, Structural Designer, MEP Drafter and Architectural Visualizer in India and globally.",
  },
  {
    category: "enrollment",
    question: "How do I enroll in a course?",
    answer:
      "Submit an enquiry through the contact form, call our admissions helpline or connect on WhatsApp. A counselor will outline your roadmap and reserve a seat in the next batch.",
  },
  {
    category: "enrollment",
    question: "What is the fee structure?",
    answer:
      "Fees depend on the software track and package selected. Our admissions team shares a detailed fee schedule, batch dates and available payment plans during counseling.",
  },
  {
    category: "enrollment",
    question: "Do you offer any placement assistance?",
    answer:
      "We focus on engineering excellence and realistic capability building. We do not provide hollow placement guarantees, but we do offer CV optimization, mock testing and portfolio preparation to help you clear strict design-testing rounds.",
  },
  {
    category: "practicalities",
    question: "Is the training completely offline?",
    answer:
      "No \u2014 we run both offline and online batches. Our modules involve heavy collaborative design coordination, clash analysis and workstation workflows. Offline students work through these in our physical engineering-office-style lab; online students cover the same material in live, instructor-led sessions with guided screen-shared coordination.",
    showOnHome: true,
  },
  {
    category: "curriculum",
    question: "Do you teach international BIM standards?",
    answer:
      "Absolutely. We cover US, UK, Middle-East, and Indian building code compliance, coordination workflows, and LOD levels.",
    showOnHome: true,
  },
  {
    category: "enrollment",
    question: "What is the qualification required to join?",
    answer:
      "Civil Engineers, Architects, Interior Designers, MEP technicians, and students currently pursuing these branches are best suited.",
    showOnHome: true,
  },
  {
    category: "curriculum",
    question: "Are project-based modeling sets included in the course?",
    answer:
      "Yes, every domain includes real-world structures, design challenges, MEP routing assets, and render coordination setups.",
    showOnHome: true,
  },
  {
    category: "curriculum",
    question: "Can I explore multiple software combinations?",
    answer: "Yes, you can configure hybrid packages combining BIM, MEP modeling, and structural analysis software.",
    showOnHome: true,
  },
];

export const settings = {
  academyName: "BIM Career Academy",
  address: "Okhla Head, Jamia Nagar, New Delhi 110025, India",
  phone: "+91 84487 65107",
  whatsapp: "+91 84487 65107",
  email: "bimcareer1543@gmail.com",
  workingHours: "Mon - Sat (9:00 AM - 6:30 PM)",
  instagramUrl: "https://www.instagram.com/bimcareer/",
  facebookUrl: "https://facebook.com",
  linkedinUrl: "https://www.linkedin.com/company/bim-career-academy/",
  youtubeUrl: "https://youtube.com",
};

export const pages = [
  {
    path: "/",
    title: "Homepage",
    sectionCount: 12,
    metaTitle: "BIM Career Academy — Build Your Career in BIM & Design Technology",
    metaDescription:
      "India's premier offline & online training institute for BIM, Structural Design, MEP Design & Interior Design Software.",
  },
  {
    path: "/courses",
    title: "Courses Overview",
    sectionCount: 5,
    metaTitle: "Courses | BIM Career Academy",
    metaDescription:
      "Explore our comprehensive range of BIM, Structural, MEP & Interior Design training programs.",
  },
  {
    path: "/about",
    title: "About Us",
    sectionCount: 5,
    metaTitle: "About Us | BIM Career Academy",
    metaDescription:
      "Practical, industry-aligned offline & online training in BIM, structural, MEP and interior design software.",
  },
  {
    path: "/contact",
    title: "Contact",
    sectionCount: 2,
    metaTitle: "Contact | BIM Career Academy",
    metaDescription: "Submit your training query or visit our workstation lab in Okhla, New Delhi.",
  },
  {
    path: "/trainers",
    title: "Trainers",
    sectionCount: 3,
    metaTitle: "Trainers | BIM Career Academy",
    metaDescription:
      "Learn from experienced AEC industry professionals with decade-long real-world BIM and structural design consulting expertise.",
  },
  {
    path: "/projects",
    title: "Projects",
    sectionCount: 3,
    metaTitle: "Projects | BIM Career Academy",
    metaDescription:
      "Explore the practical digital construction, structural framing, and high-fidelity rendering projects executed by our students.",
  },
  {
    path: "/faq",
    title: "FAQ",
    sectionCount: 3,
    metaTitle: "FAQ | BIM Career Academy",
    metaDescription: "Answers about enrollment, batches, certifications, and workstation facilities at BIM Career Academy.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy",
    sectionCount: 5,
    metaTitle: "Privacy Policy | BIM Career Academy",
    metaDescription: "How BIM Career Academy collects, uses and protects the information you share with us.",
  },
];

/** Demo leads so the dashboard has data in development (skipped in production). */
export const demoEnquiries = [
  { fullName: "Rahul Verma", mobile: "+91 98765 43210", email: "rahul.verma@gmail.com", course: "revit-architecture", status: "new", daysAgo: 0, source: "contact_form" },
  { fullName: "Priya Nair", mobile: "+91 91234 56789", email: "priya.nair@outlook.com", course: "staad-pro", status: "follow-up", daysAgo: 0, qualification: "B.E. Civil Graduate (2025)", message: "Interested in structured steel modeling and commercial projects templates. Prefers weekend hybrid sessions.", note: "Called at 11 AM. Needs to check with family regarding offline weekend travel. Scheduled a callback on Sat morning.", source: "course_page" },
  { fullName: "Amit Patwardhan", mobile: "+91 93456 78901", email: "amit.p@yahoo.com", course: "revit-mep-master", status: "converted", daysAgo: 1, source: "contact_form" },
  { fullName: "Sneha Reddy", mobile: "+91 94567 89012", email: "sneha.reddy@gmail.com", course: "3ds-max-master", status: "contacted", daysAgo: 1, source: "course_page" },
  { fullName: "Vikram Malhotra", mobile: "+91 95678 90123", email: "vikram.malhotra@live.com", course: "navisworks-coordination", status: "new", daysAgo: 2, source: "contact_form" },
  { fullName: "Ananya Das", mobile: "+91 96789 01234", email: "ananya.das@gmail.com", course: "autocad-drafting", status: "contacted", daysAgo: 3, source: "contact_form" },
  { fullName: "Karan Johar", mobile: "+91 97890 12345", email: "karan.johar@example.com", course: "v-ray-rendering", status: "converted", daysAgo: 5, source: "course_page" },
  { fullName: "Siddharth Roy", mobile: "+91 98901 23456", email: "sid.roy@example.in", course: "tekla-structures", status: "lost", daysAgo: 6, source: "contact_form" },
  { fullName: "Neha Kulkarni", mobile: "+91 99012 34567", email: "neha.k@example.com", course: "hvac-design", status: "new", daysAgo: 4, source: "contact_form" },
  { fullName: "Rohan Desai", mobile: "+91 90123 45678", email: "rohan.desai@example.com", course: "revit-architecture", status: "follow-up", daysAgo: 12, source: "course_page" },
  { fullName: "Isha Bansal", mobile: "+91 91234 09876", email: "isha.b@example.com", course: "sketchup-3d", status: "converted", daysAgo: 20, source: "contact_form" },
  { fullName: "Manish Tiwari", mobile: "+91 92345 67890", email: "manish.t@example.com", course: "etabs-analysis", status: "contacted", daysAgo: 40, source: "contact_form" },
] as const;
