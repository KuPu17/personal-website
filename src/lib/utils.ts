import clsx, { type ClassValue } from 'clsx';

import { customAlphabet } from 'nanoid';

// ── Class merging ─────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Slug generation ───────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const blogSlugSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

/** Slug for blogs API — must match BlogCreateSchema kebab-case regex. */
export function generateBlogSlug(title: string): string {
  const base = slugify(title).replace(/^-+|-+$/g, '') || 'post';
  return `${base}-${blogSlugSuffix()}`;
}

// ── Relative time ─────────────────────────────────────────────────────────────
export function relativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// ── Truncate ──────────────────────────────────────────────────────────────────
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…';
}

// ── Reading time estimate ─────────────────────────────────────────────────────
export function readingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ── Validate URL ─────────────────────────────────────────────────────────────
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/** Ensure user-entered links satisfy zod .url() — adds https:// when missing. */
export function normalizeExternalUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
