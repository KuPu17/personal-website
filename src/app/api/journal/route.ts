import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { journal } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { JournalCreateSchema } from '@/lib/validators';

export async function GET() {
  const rows = await db.select().from(journal).orderBy(desc(journal.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = JournalCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(journal).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}
