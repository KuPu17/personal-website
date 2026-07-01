import type { Metadata } from 'next';
import BlogEditor from '@/components/private/BlogEditor';

export const metadata: Metadata = { title: 'New Post — Dashboard' };

export default function NewBlogPage() {
  return (
    <div>
      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">New Post</p>
      <h1 className="text-2xl font-semibold text-primary mb-8">Create Blog Post</h1>
      <BlogEditor />
    </div>
  );
}
