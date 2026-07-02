import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { BlogCreateSchema } from '@/lib/validators';
import { getDbErrorInfo } from '@/lib/db-safe';

// GET /api/blog — public, published only
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.isPublished, true))
      .orderBy(desc(blogs.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[BLOG GET]', info.code, info.message);
    return NextResponse.json(
      { error: 'Could not load blog posts.', hint: info.hint },
      { status: 503 },
    );
  }
}

// POST /api/blog — private (middleware guards this)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BlogCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const first =
        Object.entries(fieldErrors).find(([, msgs]) => msgs && msgs.length > 0)?.[1]?.[0] ??
        'Invalid blog data';
      return NextResponse.json({ error: first, details: parsed.error.flatten() }, { status: 400 });
    }

    const { publishedAt, ...rest } = parsed.data;
    const [row] = await db
      .insert(blogs)
      .values({
        ...rest,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const info = getDbErrorInfo(err);
    console.error('[BLOG POST]', info.code, info.message);
    return NextResponse.json(
      { error: 'Could not save blog post.', hint: info.hint, code: info.code },
      { status: info.code === '42P01' ? 503 : 500 },
    );
  }
}
