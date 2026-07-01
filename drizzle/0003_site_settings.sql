-- Site-wide settings (contact links, etc.)

CREATE TABLE IF NOT EXISTS "site_settings" (
  "key"        TEXT PRIMARY KEY,
  "value"      TEXT NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
