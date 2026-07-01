import { db } from '@/db';
import { blogs } from '@/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import type { Metadata } from 'next';
import BlogTableRow from '@/components/private/BlogTableRow';
import { queryDb } from '@/lib/db-safe';
import type { Blog } from '@/db/schema';

export const metadata: Metadata = { title: 'Blog — Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardBlogPage() {
  const posts = await queryDb(
    () => db.select().from(blogs).orderBy(desc(blogs.createdAt)),
    [] as Blog[],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">CMS</p>
          <h1 className="text-2xl font-semibold text-primary">Blog Posts</h1>
        </div>
        <Link href="/dashboard/blog/new" className="btn-primary">
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-subtle text-sm">No posts yet.</p>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-muted font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs text-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-muted font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <BlogTableRow key={post.id} post={post} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
