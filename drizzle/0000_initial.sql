-- Personal Web OS — Initial Schema
-- Generated for: PostgreSQL 15+ on AWS RDS
-- Run via: npx drizzle-kit migrate

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Blogs ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "blogs" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"           TEXT NOT NULL,
  "slug"            TEXT NOT NULL UNIQUE,
  "content_md"      TEXT NOT NULL DEFAULT '',
  "cover_image_url" TEXT,
  "is_published"    BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "blogs_is_published_idx" ON "blogs" ("is_published");
CREATE INDEX IF NOT EXISTS "blogs_slug_idx" ON "blogs" ("slug");
CREATE INDEX IF NOT EXISTS "blogs_created_at_idx" ON "blogs" ("created_at" DESC);

-- ── Projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "projects" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"             TEXT NOT NULL,
  "description"      TEXT NOT NULL,
  "demo_url"         TEXT,
  "github_url"       TEXT,
  "tech_stack"       TEXT[] NOT NULL DEFAULT '{}',
  "cover_image_url"  TEXT,
  "priority_order"   INTEGER NOT NULL DEFAULT 0,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "projects_priority_idx" ON "projects" ("priority_order" ASC);

-- ── Journal ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "journal" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_md"  TEXT NOT NULL,
  "media_urls"  TEXT[] NOT NULL DEFAULT '{}',
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "journal_created_at_idx" ON "journal" ("created_at" DESC);

-- ── Messages ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "messages" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_text"  TEXT NOT NULL,
  "is_read"       BOOLEAN NOT NULL DEFAULT FALSE,
  "ip_hash"       TEXT NOT NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "messages_is_read_idx"    ON "messages" ("is_read");
CREATE INDEX IF NOT EXISTS "messages_ip_hash_idx"    ON "messages" ("ip_hash");
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages" ("created_at" DESC);
