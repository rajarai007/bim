-- The academy now runs offline AND online batches, so the site must stop saying
-- "offline only". The copy in the two Next.js apps was updated in the same change;
-- this migration fixes the equivalent values that live in the database.
--
-- Every statement is conditional on the old wording still being present, so anything
-- already corrected by hand in the admin console is left exactly as it is, and
-- re-running this against an up-to-date database is a no-op.

-- 1. New courses should default to both modes.
ALTER TABLE courses ALTER COLUMN training_mode SET DEFAULT 'Offline & Online';

-- 2. Existing courses still carrying the old default. Courses deliberately marked
--    'Online Live' (or anything else) are left untouched.
UPDATE courses
   SET training_mode = 'Offline & Online'
 WHERE training_mode = 'Offline Lab';

-- 3. The two FAQs that told visitors the training is offline only.
UPDATE faqs
   SET answer = 'Both. We run offline batches in our advanced workstation lab at Okhla, New Delhi, and live online batches for students who cannot attend in person. Either way the training is hands-on: you work on real-world engineering coordination files, mirror actual architectural office interactions, and prepare for industry tests.'
 WHERE question = 'Is the training online or offline?'
   AND answer LIKE 'All our primary training programs are strictly offline%';

UPDATE faqs
   SET answer = 'No — we run both offline and online batches. Our modules involve heavy collaborative design coordination, clash analysis and workstation workflows. Offline students work through these in our physical engineering-office-style lab; online students cover the same material in live, instructor-led sessions with guided screen-shared coordination.'
 WHERE question = 'Is the training completely offline?'
   AND answer LIKE 'Yes, our modules require heavy collaborative%';

-- 4. SEO meta descriptions. These live in the database and override the fallbacks
--    compiled into the client, so the search snippet says "offline" until they change.
UPDATE site_pages
   SET meta_description = 'India''s premier offline & online training institute for BIM, Structural Design, MEP Design & Interior Design Software.'
 WHERE path = '/'
   AND meta_description LIKE '%premier offline training institute%';

UPDATE site_pages
   SET meta_description = 'Practical, industry-aligned offline & online training in BIM, structural, MEP and interior design software.'
 WHERE path = '/about'
   AND meta_description LIKE '%industry-aligned offline training%';

-- 5. Seeded placeholder testimonial (not a real submission — it ships in
--    src/database/seeders/data.ts). A genuine student quote would be left alone.
UPDATE testimonials
   SET quote = 'BIM Career Academy changed the trajectory of my design capabilities. The offline & online practical approach made Navisworks coordination extremely clear. Highly recommended!'
 WHERE quote LIKE '%The offline practical approach made Navisworks coordination%';
