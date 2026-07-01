'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/db/schema';

type Props = { initialProjects: Project[] };

const EMPTY_FORM = {
  name: '',
  description: '',
  demoUrl: '',
  githubUrl: '',
  huggingfaceUrl: '',
  techStack: '',
  coverImageUrl: '',
  priorityOrder: 0,
};

export default function ProjectsManager({ initialProjects }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: form[key].toString(),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setForm({
      name: p.name,
      description: p.description,
      demoUrl: p.demoUrl ?? '',
      githubUrl: p.githubUrl ?? '',
      huggingfaceUrl: p.huggingfaceUrl ?? '',
      techStack: p.techStack.join(', '),
      coverImageUrl: p.coverImageUrl ?? '',
      priorityOrder: p.priorityOrder,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      demoUrl: form.demoUrl || null,
      githubUrl: form.githubUrl || null,
      huggingfaceUrl: form.huggingfaceUrl || null,
      techStack: form.techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coverImageUrl: form.coverImageUrl || null,
      priorityOrder: Number(form.priorityOrder),
    };

    try {
      const url = editingId ? `/api/projects/${editingId}` : '/api/projects';
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary">+ New Project</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in shadow-lift">
            <h2 className="text-lg font-semibold text-primary mb-6">
              {editingId ? 'Edit Project' : 'New Project'}
            </h2>

            <div className="space-y-4">
              {[
                { label: 'Name', key: 'name' as const, placeholder: 'Project name' },
                { label: 'Demo URL', key: 'demoUrl' as const, placeholder: 'https://...' },
                { label: 'GitHub URL', key: 'githubUrl' as const, placeholder: 'https://github.com/...' },
                { label: 'Hugging Face URL', key: 'huggingfaceUrl' as const, placeholder: 'https://huggingface.co/...' },
                { label: 'Cover Image URL', key: 'coverImageUrl' as const, placeholder: 'https://...' },
                { label: 'Priority Order', key: 'priorityOrder' as const, placeholder: '0' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-subtle">{label}</label>
                  <input {...field(key)} placeholder={placeholder} className="input-base" />
                </div>
              ))}

              <div className="space-y-1">
                <label className="text-xs text-subtle">Description</label>
                <textarea
                  {...field('description')}
                  rows={3}
                  placeholder="What this project does..."
                  className="input-base resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-subtle">Tech Stack (comma-separated)</label>
                <input
                  {...field('techStack')}
                  placeholder="Next.js, TypeScript, PostgreSQL"
                  className="input-base"
                />
              </div>
            </div>

            {error && <p className="text-xs text-danger mt-3">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.description}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {initialProjects.length === 0 ? (
        <p className="text-subtle text-sm">No projects yet.</p>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-muted font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs text-muted font-medium">Stack</th>
                <th className="text-left px-4 py-3 text-xs text-muted font-medium">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {initialProjects.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-overlay/40 transition-colors">
                  <td className="px-4 py-3 text-primary font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.techStack.slice(0, 3).map((t) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">{p.priorityOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-subtle hover:text-primary transition-colors">Edit</button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-xs text-subtle hover:text-danger transition-colors">Delete</button>
                    </div>
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
