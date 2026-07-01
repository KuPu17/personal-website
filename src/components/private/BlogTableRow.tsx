'use client';
import type { Blog } from '@/db/schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = { post: Blog };

export default function BlogTableRow({ post }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = async () => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    setLoading(true);
    await fetch(`/api/blog/${post.id}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleTogglePublish = async () => {
    setLoading(true);
    await fetch(`/api/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !post.isPublished }),
    });
    router.refresh();
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-overlay/40 transition-colors">
      <td className="px-4 py-3 text-primary font-medium max-w-xs truncate">
        {post.title}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleTogglePublish}
          disabled={loading}
          className={`tag cursor-pointer hover:border-muted transition-colors ${
            post.isPublished ? 'text-success' : 'text-muted'
          }`}
        >
          {post.isPublished ? 'Published' : 'Draft'}
        </button>
      </td>
      <td className="px-4 py-3 text-muted text-xs font-mono">{date}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/dashboard/blog/${post.id}`}
            className="text-xs text-subtle hover:text-primary transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs text-subtle hover:text-danger transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
