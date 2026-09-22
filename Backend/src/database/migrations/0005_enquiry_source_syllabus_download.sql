-- Enquiries captured by the syllabus-download popup on the course page carry
-- their own source so the admin console can tell them apart from the sidebar form.

ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_source_check;
ALTER TABLE enquiries
  ADD CONSTRAINT enquiries_source_check
  CHECK (source IN ('contact_form', 'course_page', 'syllabus_download'));
