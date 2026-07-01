import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProjectUpdateSchema } from '@/lib/validators';

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const parsed = ProjectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [row] = await db
    .update(projects)
    .set(parsed.data)
    .where(eq(projects.id, params.id))
    .returning();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await db.delete(projects).where(eq(projects.id, params.id));
  return NextResponse.json({ ok: true });
}
