// Re-export Drizzle inferred types for use across the app
export type {
  Blog,
  NewBlog,
  Project,
  NewProject,
  JournalEntry,
  NewJournalEntry,
  Message,
  NewMessage,
} from '@/db/schema';

// ── API response shapes ───────────────────────────────────────────────────────
export type ApiSuccess<T = void> = T extends void
  ? { ok: true }
  : { ok: true; data: T };

export type ApiError = {
  error: string;
  details?: unknown;
};

export type ApiResponse<T = void> = ApiSuccess<T> | ApiError;

// ── Upload context ────────────────────────────────────────────────────────────
export type UploadContext = 'blog' | 'project' | 'journal';

export type PresignedUploadResponse = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
};
