import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import Image from 'next/image';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [post] = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.slug, params.slug), eq(blogs.isPublished, true)));
  if (!post) return { title: 'Not Found' };
  return { title: post.title };
}

export default async function BlogPostPage({ params }: Props) {
  const [post] = await db
    .select()
    .from(blogs)
    .where(eq(blogs.slug, params.slug));

  if (!post || !post.isPublished) notFound();

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <header className="mb-10 animate-slide-up">
        <p className="text-xs font-mono text-muted mb-4">{date}</p>
        <h1 className="text-4xl font-semibold text-bright leading-tight tracking-tight mb-0">
          {post.title}
        </h1>
      </header>

      {post.coverImageUrl && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-12 border border-border">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        >
          {post.contentMd}
        </ReactMarkdown>
      </div>
    </article>
  );
}
