import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getContactSettings, upsertContactSettings } from '@/lib/site-settings';

const PatchSchema = z.object({
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
});

export async function GET() {
  try {
    const settings = await getContactSettings();
    return NextResponse.json(settings);
  } catch (err) {
    console.error('[SITE-SETTINGS GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await upsertContactSettings(parsed.data);
    return NextResponse.json(settings);
  } catch (err) {
    console.error('[SITE-SETTINGS PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
