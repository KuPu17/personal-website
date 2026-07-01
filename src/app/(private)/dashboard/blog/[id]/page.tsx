import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BlogEditor from '@/components/private/BlogEditor';
import { isDatabaseConfigured, queryDb } from '@/lib/db-safe';

export const metadata: Metadata = { title: 'Edit Post — Dashboard' };
export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

export default async function EditBlogPage({ params }: Props) {
  if (!isDatabaseConfigured()) notFound();

  const post = await queryDb(async () => {
    const [row] = await db.select().from(blogs).where(eq(blogs.id, params.id));
    return row ?? null;
  }, null);

  if (!post) notFound();

  return (
    <div>
      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">Edit Post</p>
      <h1 className="text-2xl font-semibold text-primary mb-8">Edit Blog Post</h1>
      <BlogEditor initialData={post} />
    </div>
  );
}
