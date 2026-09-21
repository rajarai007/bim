-- Optional downloadable syllabus (PDF uploaded through the admin media library).
-- Stored as the media URL (`/uploads/…`), like `image_url`.

ALTER TABLE courses ADD COLUMN syllabus_url VARCHAR(512);
