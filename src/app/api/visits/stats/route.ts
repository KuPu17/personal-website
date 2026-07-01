import { NextResponse } from 'next/server';
import { db } from '@/db';
import { siteVisits } from '@/db/schema';
import { sql, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [[{ total }], [{ week }]] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(siteVisits),
    db
      .select({ week: sql<number>`count(*)::int` })
      .from(siteVisits)
      .where(gte(siteVisits.visitedAt, weekAgo)),
  ]);

  return NextResponse.json({ total, week });
}
