import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { isDatabaseConfigured } from '@/lib/db-safe';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload: Record<string, unknown> = {
    ok: true,
    version: process.env.npm_package_version ?? '0.1.0',
    timestamp: new Date().toISOString(),
    database: 'unknown',
  };

  if (!isDatabaseConfigured()) {
    payload.database = 'not_configured';
    return NextResponse.json(payload, { status: 503 });
  }

  try {
    await db.execute(sql`SELECT 1`);
    payload.database = 'connected';
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('[HEALTH]', err);
    
    // EXPOSE THE REAL ERROR TO THE API RESPONSE TEMPORARILY
    payload.database = 'error';
    payload.errorMessage = err?.message || String(err);
    payload.errorCode = err?.code || 'UNKNOWN_CODE';
    payload.errorStack = err?.stack || null;

    return NextResponse.json(payload, { status: 503 });
  }
}