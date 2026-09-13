-- BIM Career Academy — initial schema
-- Applies to PostgreSQL 14+ (tested on Neon / PostgreSQL 18).

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------- admin users
CREATE TABLE admin_users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(32)   NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX admin_users_email_key ON admin_users (lower(email));
CREATE TRIGGER admin_users_set_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------- media
CREATE TABLE media (
  id          SERIAL PRIMARY KEY,
  file_name   VARCHAR(255) NOT NULL,
  url         VARCHAR(512) NOT NULL UNIQUE,
  mime_type   VARCHAR(100) NOT NULL,
  size_bytes  INTEGER      NOT NULL CHECK (size_bytes >= 0),
  uploaded_by INTEGER      REFERENCES admin_users (id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------- categories
CREATE TABLE categories (
  id             SERIAL PRIMARY KEY,
  slug           VARCHAR(120) NOT NULL UNIQUE,
  name           VARCHAR(120) NOT NULL,
  badge          VARCHAR(40)  NOT NULL,
  summary        TEXT         NOT NULL,
  tagline        TEXT         NOT NULL,
  description    TEXT         NOT NULL,
  icon           VARCHAR(40)  NOT NULL DEFAULT 'box',
  footer_label   VARCHAR(120) NOT NULL,
  overview_title VARCHAR(120) NOT NULL,
  status         VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order     INTEGER      NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX categories_sort_order_idx ON categories (sort_order, id);
CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -------------------------------------------------------------------- courses
CREATE TABLE courses (
  id                SERIAL PRIMARY KEY,
  category_id       INTEGER      NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  slug              VARCHAR(160) NOT NULL UNIQUE,
  title             VARCHAR(160) NOT NULL,
  short_description TEXT         NOT NULL,
  full_description  TEXT,
  eligibility       TEXT,
  who_should_join   TEXT,
  outcomes          TEXT[]       NOT NULL DEFAULT '{}',
  syllabus          JSONB        NOT NULL DEFAULT '[]'::jsonb,
  software          TEXT[]       NOT NULL DEFAULT '{}',
  careers           TEXT[]       NOT NULL DEFAULT '{}',
  duration_weeks    INTEGER      NOT NULL CHECK (duration_weeks > 0),
  training_mode     VARCHAR(60)  NOT NULL DEFAULT 'Offline Lab',
  batch_location    VARCHAR(160),
  image_url         VARCHAR(512),
  image_alt         VARCHAR(255),
  status            VARCHAR(16)  NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'inactive')),
  is_featured       BOOLEAN      NOT NULL DEFAULT FALSE,
  meta_title        VARCHAR(160),
  meta_description  VARCHAR(320),
  sort_order        INTEGER      NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT courses_syllabus_is_array CHECK (jsonb_typeof(syllabus) = 'array')
);
CREATE INDEX courses_category_id_idx ON courses (category_id);
CREATE INDEX courses_status_idx      ON courses (status);
CREATE INDEX courses_featured_idx    ON courses (is_featured) WHERE is_featured;
CREATE INDEX courses_sort_order_idx  ON courses (sort_order, id);
CREATE TRIGGER courses_set_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------- trainers
CREATE TABLE trainers (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(120) NOT NULL,
  role             VARCHAR(120) NOT NULL,
  home_role        VARCHAR(120),
  specialization   VARCHAR(160),
  bio              TEXT         NOT NULL,
  experience_years INTEGER      NOT NULL CHECK (experience_years >= 0),
  tags             TEXT[]       NOT NULL DEFAULT '{}',
  image_url        VARCHAR(512),
  image_alt        VARCHAR(255),
  linkedin_url     VARCHAR(512),
  show_on_home     BOOLEAN      NOT NULL DEFAULT FALSE,
  status           VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order       INTEGER      NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX trainers_status_idx ON trainers (status, sort_order, id);
CREATE TRIGGER trainers_set_updated_at BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------- testimonials
CREATE TABLE testimonials (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  program    VARCHAR(160) NOT NULL,
  quote      TEXT         NOT NULL,
  rating     SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  avatar_url VARCHAR(512),
  status     VARCHAR(16)  NOT NULL DEFAULT 'pending' CHECK (status IN ('published', 'pending')),
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX testimonials_status_idx ON testimonials (status, sort_order, id);
CREATE TRIGGER testimonials_set_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------- projects
CREATE TABLE projects (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER      NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  title        VARCHAR(160) NOT NULL,
  description  TEXT         NOT NULL,
  software     TEXT[]       NOT NULL DEFAULT '{}',
  image_url    VARCHAR(512),
  image_alt    VARCHAR(255),
  show_on_home BOOLEAN      NOT NULL DEFAULT FALSE,
  status       VARCHAR(16)  NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  sort_order   INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX projects_category_id_idx ON projects (category_id);
CREATE INDEX projects_status_idx      ON projects (status, sort_order, id);
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------- faqs
CREATE TABLE faq_categories (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(60)  NOT NULL UNIQUE,
  label      VARCHAR(120) NOT NULL,
  sort_order INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE faqs (
  id              SERIAL PRIMARY KEY,
  faq_category_id INTEGER      NOT NULL REFERENCES faq_categories (id) ON DELETE RESTRICT,
  question        VARCHAR(255) NOT NULL,
  answer          TEXT         NOT NULL,
  show_on_home    BOOLEAN      NOT NULL DEFAULT FALSE,
  status          VARCHAR(16)  NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  sort_order      INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX faqs_category_id_idx ON faqs (faq_category_id);
CREATE INDEX faqs_status_idx      ON faqs (status, sort_order, id);
CREATE TRIGGER faqs_set_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------ enquiries
CREATE TABLE enquiries (
  id               SERIAL PRIMARY KEY,
  full_name        VARCHAR(120) NOT NULL,
  mobile           VARCHAR(32)  NOT NULL,
  email            VARCHAR(255),
  course_id        INTEGER      REFERENCES courses (id) ON DELETE SET NULL,
  course_name      VARCHAR(160),
  qualification    VARCHAR(160),
  experience_level VARCHAR(40),
  message          TEXT,
  consent          BOOLEAN      NOT NULL DEFAULT FALSE,
  source           VARCHAR(32)  NOT NULL DEFAULT 'contact_form' CHECK (source IN ('contact_form', 'course_page')),
  status           VARCHAR(16)  NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'contacted', 'follow-up', 'converted', 'lost')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX enquiries_status_idx     ON enquiries (status);
CREATE INDEX enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX enquiries_course_id_idx  ON enquiries (course_id);
CREATE TRIGGER enquiries_set_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE enquiry_notes (
  id            SERIAL PRIMARY KEY,
  enquiry_id    INTEGER     NOT NULL REFERENCES enquiries (id) ON DELETE CASCADE,
  admin_user_id INTEGER     REFERENCES admin_users (id) ON DELETE SET NULL,
  note          TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX enquiry_notes_enquiry_idx ON enquiry_notes (enquiry_id, created_at DESC);

-- -------------------------------------------------------------- site settings
-- Single-row table (id is always 1).
CREATE TABLE site_settings (
  id                SMALLINT     PRIMARY KEY CHECK (id = 1),
  academy_name      VARCHAR(160) NOT NULL,
  address           TEXT         NOT NULL,
  phone             VARCHAR(40)  NOT NULL,
  whatsapp          VARCHAR(40),
  email             VARCHAR(255) NOT NULL,
  working_hours     VARCHAR(120),
  logo_url          VARCHAR(512),
  instagram_url     VARCHAR(512),
  facebook_url      VARCHAR(512),
  linkedin_url      VARCHAR(512),
  youtube_url       VARCHAR(512),
  webhook_url       VARCHAR(512),
  ga_measurement_id VARCHAR(40),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------- site pages
-- Public pages of the client website: content overview + SEO meta.
CREATE TABLE site_pages (
  id               SERIAL PRIMARY KEY,
  path             VARCHAR(160) NOT NULL UNIQUE,
  title            VARCHAR(120) NOT NULL,
  section_count    SMALLINT     NOT NULL DEFAULT 0,
  meta_title       VARCHAR(160),
  meta_description VARCHAR(320),
  sort_order       INTEGER      NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER site_pages_set_updated_at BEFORE UPDATE ON site_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
