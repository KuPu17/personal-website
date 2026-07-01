-- KP-Website extensions: canvas blocks, visit analytics, huggingface URL

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "huggingface_url" TEXT;

CREATE TABLE IF NOT EXISTS "canvas_blocks" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "label"        TEXT NOT NULL,
  "block_type"   TEXT NOT NULL,
  "ref_id"       UUID,
  "external_url" TEXT,
  "slug"         TEXT,
  "puzzle_order" INTEGER,
  "spawn_order"  INTEGER NOT NULL DEFAULT 0,
  "is_visible"   BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "canvas_blocks_visible_idx" ON "canvas_blocks" ("is_visible");
CREATE INDEX IF NOT EXISTS "canvas_blocks_spawn_idx" ON "canvas_blocks" ("spawn_order" ASC);

CREATE TABLE IF NOT EXISTS "site_visits" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "visited_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "path"       TEXT NOT NULL DEFAULT '/',
  "ip_hash"    TEXT
);

CREATE INDEX IF NOT EXISTS "site_visits_visited_at_idx" ON "site_visits" ("visited_at" DESC);
