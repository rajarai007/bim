-- Admin uploads stored in the database (UPLOAD_STORAGE=db) so hosts with an
-- ephemeral filesystem (Render free tier, most PaaS containers) keep them
-- across deploys. `path` is the part of the URL after "/uploads/".

CREATE TABLE upload_files (
  path        VARCHAR(512) PRIMARY KEY,
  mime_type   VARCHAR(100) NOT NULL,
  size_bytes  INTEGER      NOT NULL,
  content     BYTEA        NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
