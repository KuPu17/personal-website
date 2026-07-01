import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { ProjectCreateSchema } from '@/lib/validators';

export async function GET() {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.priorityOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ProjectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db.insert(projects).values(parsed.data).returning();
  return NextResponse.json(row, { status: 201 });
}
