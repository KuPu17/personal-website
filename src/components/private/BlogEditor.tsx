'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Blog } from '@/db/schema';
import MarkdownEditor from './MarkdownEditor';

type Props = { initialData?: Blog };

export default function BlogEditor({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [contentMd, setContentMd] = useState(initialData?.contentMd ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? '');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-'),
      );
    }
  };

  const handleSave = async (publish?: boolean) => {
    setError('');
    setSaving(true);

    const payload = {
      title,
      slug,
      contentMd,
      coverImageUrl: coverImageUrl || null,
      isPublished: publish !== undefined ? publish : isPublished,
    };

    try {
      const url = isEdit ? `/api/blog/${initialData!.id}` : '/api/blog';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Save failed');
      }

      router.push('/dashboard/blog');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs text-subtle font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          className="input-base text-base font-semibold"
        />
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label className="text-xs text-subtle font-medium">Slug</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono">/blog/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-slug"
            className="input-base font-mono text-sm flex-1"
          />
        </div>
      </div>

      {/* Cover image URL */}
      <div className="space-y-1.5">
        <label className="text-xs text-subtle font-medium">Cover Image URL</label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://..."
          className="input-base font-mono text-xs"
        />
        <p className="text-xs text-muted">
          Upload an image via the editor toolbar, then paste the URL here.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label className="text-xs text-subtle font-medium">Content</label>
        <MarkdownEditor
          value={contentMd}
          onChange={setContentMd}
          context="blog"
          placeholder="# Your post title&#10;&#10;Start writing..."
        />
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || !title || !slug}
          className="btn-ghost border border-border"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving || !title || !slug || !contentMd}
          className="btn-primary"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPublished ? (
            'Update & Publish'
          ) : (
            'Publish'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
