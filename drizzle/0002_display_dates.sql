-- Display dates + works card metadata

ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMPTZ;

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "display_month" INTEGER;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "display_year" INTEGER;

ALTER TABLE "canvas_blocks" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "canvas_blocks" ADD COLUMN IF NOT EXISTS "cover_image_url" TEXT;
ALTER TABLE "canvas_blocks" ADD COLUMN IF NOT EXISTS "display_month" INTEGER;
ALTER TABLE "canvas_blocks" ADD COLUMN IF NOT EXISTS "display_year" INTEGER;
