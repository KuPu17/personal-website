import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { BlogCreateSchema } from '@/lib/validators';

// GET /api/blog — public, published only
export async function GET() {
  const rows = await db
    .select()
    .from(blogs)
    .where(eq(blogs.isPublished, true))
    .orderBy(desc(blogs.createdAt));
  return NextResponse.json(rows);
}

// POST /api/blog — private (middleware guards this)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = BlogCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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
}
