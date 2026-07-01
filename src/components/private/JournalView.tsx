'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JournalEntry } from '@/db/schema';
import MarkdownEditor from './MarkdownEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = { initialEntries: JournalEntry[] };
type Mode = 'list' | 'compose' | 'read';

export default function JournalView({ initialEntries }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('list');
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openCompose = () => {
    setContent('');
    setSelected(null);
    setMode('compose');
  };

  const openRead = (entry: JournalEntry) => {
    setSelected(entry);
    setMode('read');
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentMd: content, mediaUrls: [] }),
      });
      if (res.ok) {
        setMode('list');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/journal/${id}`, { method: 'DELETE' });
    setDeleting(false);
    setMode('list');
    router.refresh();
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // ── Compose ──────────────────────────────────────────────────────────────────
  if (mode === 'compose') {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-muted">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <button onClick={() => setMode('list')} className="btn-ghost text-xs">✕ Discard</button>
        </div>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          context="journal"
          placeholder="What's on your mind..."
          rows={20}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="btn-primary"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Save Entry'}
          </button>
        </div>
      </div>
    );
  }

  // ── Read ─────────────────────────────────────────────────────────────────────
  if (mode === 'read' && selected) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setMode('list')} className="text-xs text-subtle hover:text-primary transition-colors">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const title = prompt('Blog post title?');
                if (!title) return;
                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '');
                const res = await fetch('/api/blog', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title,
                    slug,
                    contentMd: selected.contentMd,
                    isPublished: false,
                  }),
                });
                if (res.ok) {
                  const blog = await res.json();
                  router.push(`/dashboard/blog/${blog.id}`);
                }
              }}
              className="text-xs text-subtle hover:text-accent transition-colors"
            >
              Publish to Blog
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              disabled={deleting}
              className="text-xs text-subtle hover:text-danger transition-colors"
            >
              Delete Entry
            </button>
          </div>
        </div>
        <p className="text-xs font-mono text-muted mb-6">{formatDate(selected.createdAt)}</p>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.contentMd}</ReactMarkdown>
        </div>
        {selected.mediaUrls.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {selected.mediaUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt="journal media"
                className="rounded-lg border border-border w-full object-cover"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── List ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-end">
        <button onClick={openCompose} className="btn-primary">+ New Entry</button>
      </div>

      {initialEntries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-subtle text-sm">No entries yet. Start writing.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {initialEntries.map((entry) => {
            const preview = entry.contentMd.replace(/[#*`\[\]]/g, '').slice(0, 120);
            return (
              <button
                key={entry.id}
                onClick={() => openRead(entry)}
                className="w-full text-left card hover:border-muted transition-colors group"
              >
                <p className="text-xs font-mono text-muted mb-2">
                  {formatDate(entry.createdAt)}
                </p>
                <p className="text-sm text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                  {preview}
                  {entry.contentMd.length > 120 && '…'}
                </p>
                {entry.mediaUrls.length > 0 && (
                  <p className="text-xs text-muted mt-2">
                    {entry.mediaUrls.length} attachment{entry.mediaUrls.length > 1 ? 's' : ''}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
