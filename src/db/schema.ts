import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const blogs = pgTable('blogs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  contentMd: text('content_md').notNull().default(''),
  coverImageUrl: text('cover_image_url'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  demoUrl: text('demo_url'),
  githubUrl: text('github_url'),
  huggingfaceUrl: text('huggingface_url'),
  techStack: text('tech_stack').array().notNull().default(sql`'{}'`),
  coverImageUrl: text('cover_image_url'),
  displayMonth: integer('display_month'),
  displayYear: integer('display_year'),
  priorityOrder: integer('priority_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const journal = pgTable('journal', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentMd: text('content_md').notNull(),
  mediaUrls: text('media_urls').array().notNull().default(sql`'{}'`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageText: text('message_text').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  ipHash: text('ip_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const canvasBlocks = pgTable('canvas_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label').notNull(),
  blockType: text('block_type').notNull(),
  refId: uuid('ref_id'),
  externalUrl: text('external_url'),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  displayMonth: integer('display_month'),
  displayYear: integer('display_year'),
  slug: text('slug'),
  puzzleOrder: integer('puzzle_order'),
  spawnOrder: integer('spawn_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const siteVisits = pgTable('site_visits', {
  id: uuid('id').defaultRandom().primaryKey(),
  visitedAt: timestamp('visited_at', { withTimezone: true }).notNull().defaultNow(),
  path: text('path').notNull().default('/'),
  ipHash: text('ip_hash'),
});

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type JournalEntry = typeof journal.$inferSelect;
export type NewJournalEntry = typeof journal.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type CanvasBlock = typeof canvasBlocks.$inferSelect;
export type NewCanvasBlock = typeof canvasBlocks.$inferInsert;
export type SiteVisit = typeof siteVisits.$inferSelect;

export type BlockType =
  | 'website'
  | 'project'
  | 'blog'
  | 'linkedin'
  | 'email'
  | 'inbox';
