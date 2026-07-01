'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CanvasBlock } from '@/db/schema';

type Props = {
  initialBlocks: CanvasBlock[];
};

const EMPTY = {
  label: '',
  externalUrl: '',
  displayMonth: '',
  displayYear: '',
  spawnOrder: 0,
  isVisible: true,
};

export default function CanvasBlocksManager({ initialBlocks }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (block: CanvasBlock) => {
    setForm({
      label: block.label,
      externalUrl: block.externalUrl ?? '',
      displayMonth: block.displayMonth?.toString() ?? '',
      displayYear: block.displayYear?.toString() ?? '',
      spawnOrder: block.spawnOrder,
      isVisible: block.isVisible,
    });
    setEditingId(block.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const payload = {
      label: form.label,
      blockType: 'website' as const,
      refId: null,
      externalUrl: form.externalUrl || null,
      slug: null,
      puzzleOrder: null,
      displayMonth: form.displayMonth ? Number(form.displayMonth) : null,
      displayYear: form.displayYear ? Number(form.displayYear) : null,
      spawnOrder: Number(form.spawnOrder),
      isVisible: form.isVisible,
    };

    try {
      const url = editingId
        ? `/api/canvas-blocks/manage/${editingId}`
        : '/api/canvas-blocks/manage';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      setShowForm(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this work?')) return;
    await fetch(`/api/canvas-blocks/manage/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary">+ Work</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-primary mb-6">
              {editingId ? 'Edit Work' : 'New Work'}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-subtle">Title</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="input-base"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-subtle">URL</label>
                <input
                  value={form.externalUrl}
                  onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))}
                  className="input-base"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-subtle">Month (1–12)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={form.displayMonth}
                    onChange={(e) => setForm((f) => ({ ...f, displayMonth: e.target.value }))}
                    className="input-base"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-subtle">Year</label>
                  <input
                    type="number"
                    value={form.displayYear}
                    onChange={(e) => setForm((f) => ({ ...f, displayYear: e.target.value }))}
                    className="input-base"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-subtle">Sort order</label>
                  <input
                    type="number"
                    value={form.spawnOrder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, spawnOrder: Number(e.target.value) }))
                    }
                    className="input-base"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
                />
                Visible on /works
              </label>
            </div>

            {error && <p className="text-xs text-danger mt-3">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.label || !form.externalUrl}
                className="btn-primary flex-1"
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {initialBlocks.length === 0 ? (
        <p className="text-subtle text-sm">No works yet. Add one or use controller mode on /works.</p>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-muted">Title</th>
                <th className="text-left px-4 py-3 text-xs text-muted">URL</th>
                <th className="text-left px-4 py-3 text-xs text-muted">Date</th>
                <th className="text-left px-4 py-3 text-xs text-muted">Visible</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {initialBlocks.map((block) => (
                <tr key={block.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-primary">{block.label}</td>
                  <td className="px-4 py-3 text-muted truncate max-w-[12rem]">
                    {block.externalUrl ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">
                    {block.displayMonth && block.displayYear
                      ? `${block.displayMonth}/${block.displayYear}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted">{block.isVisible ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(block)}
                      className="text-xs text-subtle hover:text-primary mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(block.id)}
                      className="text-xs text-subtle hover:text-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
