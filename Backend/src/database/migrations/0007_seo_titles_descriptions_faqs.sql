-- Search-engine copy that lives in the database: page titles and meta descriptions
-- (they override the fallbacks compiled into the client), the course meta, and the
-- FAQ page. The client-side SEO work (canonical URLs, structured data, sitemap)
-- shipped in the same change.
--
-- Every statement is conditional on the value it replaces still being the old
-- stock wording, so anything already rewritten in the admin console is left exactly
-- as it is, and re-running this against an up-to-date database is a no-op. On a
-- fresh database it runs before the seeder, finds no rows, and does nothing.

-- 1. Static pages: one unique, keyword-led title and a description per page.
--    Title and description are updated independently of each other.
UPDATE site_pages SET meta_title = 'BIM Training Institute in Delhi | BIM Career Academy'
 WHERE path = '/' AND meta_title = 'BIM Career Academy — Build Your Career in BIM & Design Technology';
UPDATE site_pages SET meta_description = 'BIM training institute in Delhi for Revit Architecture, Revit Structure, Revit MEP and Navisworks. Project-based classes at Okhla, New Delhi, and live online.'
 WHERE path = '/' AND meta_description LIKE 'India''s premier offline & online training institute for BIM, Structural Design%';

UPDATE site_pages SET meta_title = 'BIM & Revit Courses in Delhi | BIM Career Academy'
 WHERE path = '/courses' AND meta_title = 'Courses | BIM Career Academy';
UPDATE site_pages SET meta_description = 'Compare BIM courses in Delhi: Revit Architecture, Revit Structure, Revit MEP and Navisworks BIM coordination. Check duration, syllabus and batch options.'
 WHERE path = '/courses' AND meta_description LIKE 'Explore our comprehensive range of BIM, Structural%';

UPDATE site_pages SET meta_title = 'About BIM Career Academy | BIM Institute in New Delhi'
 WHERE path = '/about' AND meta_title = 'About Us | BIM Career Academy';
UPDATE site_pages SET meta_description = 'BIM Career Academy is a BIM institute in Okhla, New Delhi, founded by Mohd Asif. Practical Revit, Navisworks, structural and MEP training, offline and online.'
 WHERE path = '/about' AND meta_description LIKE 'Practical, industry-aligned offline & online training in BIM, structural%';

UPDATE site_pages SET meta_title = 'Contact BIM Career Academy | Okhla, New Delhi'
 WHERE path = '/contact' AND meta_title = 'Contact | BIM Career Academy';
UPDATE site_pages SET meta_description = 'Visit BIM Career Academy at Okhla Head, Jamia Nagar, New Delhi 110025, call or WhatsApp +91 84487 65107, or send an enquiry about BIM, Revit and MEP courses.'
 WHERE path = '/contact' AND meta_description = 'Submit your training query or visit our workstation lab in Okhla, New Delhi.';

UPDATE site_pages SET meta_title = 'BIM & Revit Trainers | BIM Career Academy'
 WHERE path = '/trainers' AND meta_title = 'Trainers | BIM Career Academy';
UPDATE site_pages SET meta_description = 'Meet the trainers at BIM Career Academy, New Delhi, and see their experience, specialisations and the BIM, Revit and structural software they teach.'
 WHERE path = '/trainers' AND meta_description LIKE 'Learn from experienced AEC industry professionals with decade-long%';

UPDATE site_pages SET meta_title = 'BIM Training Projects | BIM Career Academy'
 WHERE path = '/projects' AND meta_title = 'Projects | BIM Career Academy';
UPDATE site_pages SET meta_description = 'Browse the BIM, structural and MEP projects students work on at BIM Career Academy, New Delhi, from coordinated Revit models to MEP services layouts.'
 WHERE path = '/projects' AND meta_description LIKE 'Explore the practical digital construction, structural framing, and high-fidelity rendering%';

UPDATE site_pages SET meta_title = 'BIM Course FAQs | BIM Career Academy'
 WHERE path = '/faq' AND meta_title = 'FAQ | BIM Career Academy';
UPDATE site_pages SET meta_description = 'Answers to common questions about BIM and Revit training at BIM Career Academy, New Delhi: courses, duration, eligibility, online classes and fees.'
 WHERE path = '/faq' AND meta_description = 'Answers about enrollment, batches, certifications, and workstation facilities at BIM Career Academy.';

-- 2. Course pages: "<course> Course in Delhi" titles, and descriptions short enough
--    to be shown whole in a search result (two of them ran past 180 characters).
UPDATE courses SET meta_title = 'Revit Architecture Course in Delhi | BIM Career Academy'
 WHERE slug = 'revit-architecture' AND meta_title = 'Revit Architecture Course (2 Months) | BIM Career Academy';
UPDATE courses SET meta_description = 'Revit Architecture course in Delhi: 2 months, 25 modules on modeling, families, documentation, schedules and worksharing, with live projects. Offline & online.'
 WHERE slug = 'revit-architecture' AND meta_description LIKE '2-month Revit Architecture course in New Delhi: 25 modules covering%';

UPDATE courses SET meta_title = 'Revit Structure Course in Delhi | BIM Career Academy'
 WHERE slug = 'revit-structure' AND meta_title = 'Revit Structure Course (2 Months) | BIM Career Academy';
UPDATE courses SET meta_description = 'Revit Structure course in Delhi: 2 months of RCC, steel and PEB modeling, rebar detailing and BBS, documentation and live projects. Offline & online batches.'
 WHERE slug = 'revit-structure' AND meta_description LIKE '2-month Revit Structure course in New Delhi: RCC, steel and PEB modeling%';

UPDATE courses SET meta_title = 'Revit MEP Course in Delhi | BIM Career Academy'
 WHERE slug = 'revit-mep' AND meta_title = 'Revit MEP Course (4 Months) | BIM Career Academy';
UPDATE courses SET meta_description = 'Revit MEP course in Delhi: 4 months covering HVAC, electrical, plumbing and fire protection BIM, coordination and four live projects. Offline & online batches.'
 WHERE slug = 'revit-mep' AND meta_description LIKE '4-month Revit MEP course in New Delhi covering HVAC, electrical, plumbing%';

UPDATE courses SET meta_title = 'Navisworks BIM Coordination Course in Delhi | BIM Career Academy'
 WHERE slug = 'navisworks-coordination' AND meta_title = 'Navisworks Manage BIM Coordination Course | BIM Career Academy';
UPDATE courses SET meta_description = 'Navisworks Manage course in Delhi: 8 weeks of clash detection, coordination reports, TimeLiner 4D simulation and quantification, with portfolio projects.'
 WHERE slug = 'navisworks-coordination' AND meta_description LIKE '8-week Navisworks Manage course in New Delhi: federated models, search sets%';

-- 3. FAQ answers that no longer matched the site.
--    3a. Reads as "offline and online, conducted in our lab"; 0006 meant to replace it but
--        the text had already been reworded by hand, so its condition never matched.
UPDATE faqs
   SET answer = 'Both. We run offline batches in our advanced workstation lab at Okhla, New Delhi, and live online batches for students who cannot attend in person. Either way the training is hands-on: you work on real-world engineering coordination files, mirror actual architectural office interactions, and prepare for industry tests.'
 WHERE question = 'Is the training online or offline?'
   AND answer LIKE 'All our primary training programs are offline and online%';

--    3b. Said "4 to 6 weeks" while every course page states 2 or 4 months. Only applied
--        where the catalogue really has those durations.
UPDATE faqs
   SET answer = 'Revit Architecture, Revit Structure and Navisworks Manage each run for 2 months, and Revit MEP runs for 4 months. If you combine courses, the total duration depends on the combination you choose, and the admissions team will plan the sequence with you.'
 WHERE question = 'What is the duration of courses?'
   AND answer LIKE 'Individual software mastery modules typically span 4 to 6 weeks%'
   AND (SELECT count(*) FROM courses
         WHERE status = 'active'
           AND (slug, duration_weeks) IN (('revit-architecture', 8), ('revit-structure', 8), ('navisworks-coordination', 8), ('revit-mep', 16))) = 4;

--    3c. Mentioned "render coordination setups" (the visualisation track is gone). Now names
--        the live projects each course page lists.
UPDATE faqs
   SET answer = 'Yes. Every course ends with live projects. Revit Architecture is applied on residential, commercial, hospital and institutional buildings; Revit Structure on an RCC multi-storey building and a PEB industrial building; Revit MEP on four projects, from a commercial building to a hospital; and Navisworks on full coordination projects with clash reports and 4D simulation.'
 WHERE question = 'Are project-based modeling sets included in the course?'
   AND answer = 'Yes, every domain includes real-world structures, design challenges, MEP routing assets, and render coordination setups.'
   AND (SELECT count(*) FROM courses
         WHERE status = 'active'
           AND slug IN ('revit-architecture', 'revit-structure', 'revit-mep', 'navisworks-coordination')) = 4;

-- 4. New FAQs for questions people actually search before choosing a BIM course. The
--    answers explain the subject or restate what the course pages already say; none of
--    them adds a claim about fees, placements or results. Skipped when a question already
--    exists, and where the four courses they name are not all published.
INSERT INTO faqs (faq_category_id, question, answer, show_on_home, status, sort_order)
SELECT c.id, v.question, v.answer, FALSE, 'published', (SELECT COALESCE(MAX(sort_order), 0) FROM faqs) + v.position
  FROM (VALUES
    (1, 'general', 'What is BIM training?',
     'BIM (Building Information Modeling) training teaches you to build and manage a data-rich 3D model of a building instead of separate 2D drawings. Every wall, beam, duct and pipe in the model carries information such as size, material and quantity, so drawings, schedules and clash checks all come from one coordinated source. At BIM Career Academy this means Autodesk Revit for architectural, structural and MEP modeling, and Navisworks Manage for coordination and clash detection.'),
    (2, 'general', 'Do you offer Revit training in Delhi?',
     'Yes. Revit Architecture, Revit Structure and Revit MEP are taught in classroom batches at our centre in Okhla, New Delhi. The same courses also run as live online batches for students who cannot travel to Delhi.'),
    (3, 'general', 'Is BIM training suitable for civil engineers?',
     'Yes. Civil engineers are one of the main groups we train. Revit Structure covers RCC, steel and PEB modeling with reinforcement detailing and BBS-oriented schedules, Revit Architecture covers building modeling and drawing production, and Navisworks Manage prepares you for BIM coordination roles. Civil engineering students and working professionals can both join.'),
    (4, 'general', 'Is BIM training useful for mechanical and electrical engineers?',
     'Yes. Revit MEP is built for mechanical, electrical and plumbing engineers. The course covers HVAC equipment and ductwork, electrical lighting, power, panels and containment, plumbing and drainage, and fire protection, then brings the disciplines together through coordination and clash review.'),
    (5, 'curriculum', 'Which BIM software should I learn first?',
     'Start with Revit in your own discipline: Revit Architecture if you work on building design and documentation, Revit Structure if you are a civil or structural engineer, and Revit MEP if you come from mechanical, electrical or plumbing. Navisworks Manage is best taken after that, because clash detection and coordination make more sense once you can read and build a model.'),
    (6, 'curriculum', 'What is the difference between Revit Architecture and Revit Structure?',
     'Both use the same Autodesk Revit software but model different parts of a building. Revit Architecture focuses on the design model: walls, doors, windows, floors, roofs, stairs, curtain walls, rooms and the architectural drawing set. Revit Structure focuses on the load-bearing model: columns, beams, slabs, foundations, reinforcement and steel connections, with structural drawings and schedules. Architects usually begin with Revit Architecture, and civil or structural engineers with Revit Structure.'),
    (7, 'curriculum', 'What is the difference between Revit and Navisworks?',
     'Revit is an authoring tool: you use it to build the architectural, structural or MEP model and produce drawings from it. Navisworks Manage is a review and coordination tool: it combines the models from different disciplines into one federated model so you can run clash detection, track issues, simulate the construction sequence in 4D and take off quantities. Most BIM coordinators use both.'),
    (8, 'enrollment', 'Do I need to know AutoCAD before learning Revit?',
     'No. Our Revit Architecture and Revit MEP courses start from BIM fundamentals and need only basic computer skills, with no prior Revit experience. For Revit Structure, being able to read structural drawings helps. AutoCAD knowledge is useful when you link DWG files into a model, but it is not a requirement for joining.')
  ) AS v(position, category, question, answer)
  JOIN faq_categories c ON c.slug = v.category
 WHERE NOT EXISTS (SELECT 1 FROM faqs f WHERE f.question = v.question)
   AND (SELECT count(*) FROM courses
         WHERE status = 'active'
           AND slug IN ('revit-architecture', 'revit-structure', 'revit-mep', 'navisworks-coordination')) = 4;
