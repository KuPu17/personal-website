import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AuthSchema = z.object({
  passcode: z.string().min(1).max(128),
});

// ─── Blog ─────────────────────────────────────────────────────────────────────
export const BlogCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  contentMd: z.string().max(500_000),
  coverImageUrl: z.string().url().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const BlogUpdateSchema = BlogCreateSchema.partial();

// ─── Project ──────────────────────────────────────────────────────────────────
export const ProjectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  demoUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  huggingfaceUrl: z.string().url().optional().nullable(),
  techStack: z.array(z.string().max(50)).max(20).default([]),
  coverImageUrl: z.string().url().optional().nullable(),
  displayMonth: z.number().int().min(1).max(12).optional().nullable(),
  displayYear: z.number().int().min(1970).max(2100).optional().nullable(),
  priorityOrder: z.number().int().min(0).default(0),
});

export const CanvasBlockCreateSchema = z.object({
  label: z.string().min(1).max(200),
  blockType: z.enum(['website', 'project', 'blog']),
  refId: z.string().uuid().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  displayMonth: z.number().int().min(1).max(12).optional().nullable(),
  displayYear: z.number().int().min(1970).max(2100).optional().nullable(),
  slug: z.string().optional().nullable(),
  puzzleOrder: z.number().int().min(1).max(10).optional().nullable(),
  spawnOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const CanvasBlockUpdateSchema = CanvasBlockCreateSchema.partial();

export const VisitCreateSchema = z.object({
  path: z.string().max(500).default('/'),
});

export const ProjectUpdateSchema = ProjectCreateSchema.partial();

// ─── Journal ─────────────────────────────────────────────────────────────────
export const JournalCreateSchema = z.object({
  contentMd: z.string().min(1).max(500_000),
  mediaUrls: z.array(z.string().url()).max(20).default([]),
});

export const JournalUpdateSchema = JournalCreateSchema.partial();

// ─── Message (public inbox) ───────────────────────────────────────────────────
export const MessageCreateSchema = z.object({
  messageText: z.string().min(1).max(2000),
  website: z.string().max(0).optional(), // honeypot — must be empty
});

// ─── Presigned URL request ────────────────────────────────────────────────────
export const UploadRequestSchema = z.object({
  context: z.enum(['blog', 'project', 'journal']),
  mimeType: z.string().min(1),
  fileExtension: z
    .string()
    .regex(/^\.[a-z0-9]+$/i)
    .max(10),
});
