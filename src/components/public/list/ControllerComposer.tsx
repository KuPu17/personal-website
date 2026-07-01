'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { slugify } from '@/lib/utils';
import { MONTH_OPTIONS, toDateInputValue } from '@/lib/list-dates';
import type { ListCardData } from '@/lib/list-content';

export type ControllerPageType = 'blogs' | 'works' | 'projects';

type FormState = {
  title: string;
  description: string;
  link: string;
  content: string;
  imageUrl: string;
  isPrivate: boolean;
  publishedDate: string;
  displayMonth: string;
  displayYear: string;
};

type Props = {
  pageType: ControllerPageType;
  themeColor: string;
  onClose: () => void;
  editItem?: ListCardData | null;
};

const EMPTY: FormState = {
  title: '',
  description: '',
  link: '',
  content: '',
  imageUrl: '',
  isPrivate: false,
  publishedDate: '',
  displayMonth: '',
  displayYear: '',
};

function itemToForm(item: ListCardData): FormState {
  return {
    title: item.title,
    description: item.description ?? '',
    link: item.href ?? '',
    content: item.contentMd ?? '',
    imageUrl: item.imageUrl ?? '',
    isPrivate: Boolean(item.isPrivate),
    publishedDate: toDateInputValue(item.publishedAt),
    displayMonth: item.displayMonth ? String(item.displayMonth) : '',
    displayYear: item.displayYear ? String(item.displayYear) : '',
  };
}

export default function ControllerComposer({
  pageType,
  themeColor,
  onClose,
  editItem = null,
}: Props) {
  const router = useRouter();
  const isEditing = Boolean(editItem?.id);
  const uploadContext = pageType === 'projects' ? 'project' : 'blog';
  const { state: uploadState, upload } = useMediaUpload(uploadContext);
  const [form, setForm] = useState<FormState>(() =>
    editItem ? itemToForm(editItem) : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set =
    (key: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value =
        event.target.type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      setForm((current) => ({ ...current, [key]: value }));
    };

  const handleImagePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setForm((current) => ({ ...current, imageUrl: url }));
  };

  const parseMonthYear = () => {
    const displayMonth = form.displayMonth
      ? Number.parseInt(form.displayMonth, 10)
      : null;
    const displayYear = form.displayYear
      ? Number.parseInt(form.displayYear, 10)
      : null;
    return { displayMonth, displayYear };
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      if (pageType === 'blogs') {
        const title = form.title.trim();
        const contentMd = form.content.trim();
        if (!title || !contentMd) {
          throw new Error('Title and content are required.');
        }

        const payload = {
          title,
          contentMd,
          coverImageUrl: form.imageUrl.trim() || null,
          isPublished: !form.isPrivate,
          publishedAt: form.publishedDate
            ? new Date(`${form.publishedDate}T12:00:00.000Z`).toISOString()
            : null,
        };

        const res = await fetch(
          isEditing ? `/api/blog/${editItem!.id}` : '/api/blog',
          {
            method: isEditing ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              isEditing
                ? payload
                : { ...payload, slug: `${slugify(title)}-${nanoid(6)}` },
            ),
          },
        );

        if (!res.ok) throw new Error('Could not save blog post.');
      }

      if (pageType === 'projects') {
        const name = form.title.trim();
        const description = form.description.trim();
        const demoUrl = form.link.trim();
        if (!name || !description || !demoUrl) {
          throw new Error('Title, description, and link are required.');
        }

        const { displayMonth, displayYear } = parseMonthYear();
        const payload = {
          name,
          description,
          demoUrl,
          coverImageUrl: form.imageUrl.trim() || null,
          displayMonth,
          displayYear,
        };

        const res = await fetch(
          isEditing ? `/api/projects/${editItem!.id}` : '/api/projects',
          {
            method: isEditing ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              isEditing
                ? payload
                : {
                    ...payload,
                    githubUrl: null,
                    huggingfaceUrl: null,
                    techStack: [],
                    priorityOrder: 0,
                  },
            ),
          },
        );

        if (!res.ok) throw new Error('Could not save project.');
      }

      if (pageType === 'works') {
        const label = form.title.trim();
        const externalUrl = form.link.trim();
        if (!label || !externalUrl) {
          throw new Error('Title and link are required.');
        }

        const { displayMonth, displayYear } = parseMonthYear();
        const payload = {
          label,
          externalUrl,
          description: form.description.trim() || null,
          coverImageUrl: form.imageUrl.trim() || null,
          displayMonth,
          displayYear,
        };

        const res = await fetch(
          isEditing
            ? `/api/canvas-blocks/manage/${editItem!.id}`
            : '/api/canvas-blocks/manage',
          {
            method: isEditing ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              isEditing
                ? payload
                : {
                    ...payload,
                    blockType: 'website',
                    isVisible: true,
                    spawnOrder: Date.now(),
                  },
            ),
          },
        );

        if (!res.ok) throw new Error('Could not save work.');
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const showDescription = pageType !== 'blogs';
  const showContent = pageType === 'blogs';
  const showPrivate = pageType === 'blogs';
  const showBlogDate = pageType === 'blogs';
  const showMonthYear = pageType === 'works' || pageType === 'projects';

  return (
    <div
      className="list-card controller-composer"
      style={{ '--list-card-bg': themeColor } as React.CSSProperties}
    >
      <div className="controller-composer__toolbar">
        <span className="controller-composer__label">
          {isEditing ? 'edit entry' : 'new entry'}
        </span>
        <button
          type="button"
          className="controller-composer__close"
          onClick={onClose}
          aria-label="Cancel"
        >
          ×
        </button>
      </div>

      <div className="controller-composer__media-row">
        {form.imageUrl ? (
          <div className="list-card__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl} alt="" className="list-card__image" />
          </div>
        ) : (
          <label className="controller-composer__upload">
            <input
              type="file"
              accept="image/*"
              className="controller-composer__file"
              onChange={handleImagePick}
              disabled={uploadState.uploading}
            />
            {uploadState.uploading ? 'uploading…' : '+ image'}
          </label>
        )}
      </div>

      <div className="controller-composer__fields">
        {showBlogDate && (
          <label className="controller-composer__field">
            <span>date</span>
            <input
              type="date"
              value={form.publishedDate}
              onChange={set('publishedDate')}
              className="controller-composer__input"
            />
          </label>
        )}

        {showMonthYear && (
          <div className="controller-composer__row">
            <label className="controller-composer__field">
              <span>month</span>
              <select
                value={form.displayMonth}
                onChange={set('displayMonth')}
                className="controller-composer__input"
              >
                <option value="">—</option>
                {MONTH_OPTIONS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="controller-composer__field">
              <span>year</span>
              <input
                type="number"
                min={1970}
                max={2100}
                value={form.displayYear}
                onChange={set('displayYear')}
                placeholder="2026"
                className="controller-composer__input"
              />
            </label>
          </div>
        )}

        <label className="controller-composer__field">
          <span>title</span>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="heading"
            className="controller-composer__input"
          />
        </label>

        {showDescription && (
          <label className="controller-composer__field">
            <span>description</span>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="short description"
              rows={3}
              className="controller-composer__textarea"
            />
          </label>
        )}

        {showContent && (
          <label className="controller-composer__field">
            <span>content</span>
            <textarea
              value={form.content}
              onChange={set('content')}
              placeholder="write your post…"
              rows={6}
              className="controller-composer__textarea"
            />
          </label>
        )}

        {pageType !== 'blogs' && (
          <label className="controller-composer__field">
            <span>link</span>
            <input
              type="url"
              value={form.link}
              onChange={set('link')}
              placeholder="https://…"
              className="controller-composer__input"
            />
          </label>
        )}

        {showPrivate && (
          <label className="controller-composer__toggle">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={set('isPrivate')}
            />
            <span>private (hidden from public)</span>
          </label>
        )}

        {error && <p className="controller-composer__error">{error}</p>}
        {uploadState.error && (
          <p className="controller-composer__error">{uploadState.error}</p>
        )}
      </div>

      <div className="controller-composer__actions">
        <button
          type="button"
          className="controller-composer__save"
          onClick={handleSave}
          disabled={saving || uploadState.uploading}
          aria-label="Save"
        >
          {saving ? '…' : '✓'}
        </button>
      </div>
    </div>
  );
}
