-- Admin profile (avatar) + self-service password reset tokens.

ALTER TABLE admin_users ADD COLUMN avatar_url VARCHAR(512);
-- Existing admins keep the console's default avatar.
UPDATE admin_users SET avatar_url = '/images/avatar-admin.png' WHERE avatar_url IS NULL;

CREATE TABLE password_reset_tokens (
  id            SERIAL PRIMARY KEY,
  admin_user_id INTEGER     NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  token_hash    CHAR(64)    NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX password_reset_tokens_user_idx ON password_reset_tokens (admin_user_id, created_at DESC);
