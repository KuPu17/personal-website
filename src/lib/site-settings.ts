import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { queryDb, isDatabaseConfigured } from '@/lib/db-safe';
import {
  DEFAULT_EMAIL,
  DEFAULT_LINKEDIN,
} from '@/lib/site-contacts';

export type ContactSettings = {
  email: string;
  linkedin: string;
};

async function readSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key));
  return row?.value ?? null;
}

export async function getContactSettings(): Promise<ContactSettings> {
  return queryDb(async () => {
    const [email, linkedin] = await Promise.all([
      readSetting('contact_email'),
      readSetting('contact_linkedin'),
    ]);
    return {
      email: email ?? DEFAULT_EMAIL,
      linkedin: linkedin ?? DEFAULT_LINKEDIN,
    };
  }, { email: DEFAULT_EMAIL, linkedin: DEFAULT_LINKEDIN });
}

export async function upsertContactSettings(
  partial: Partial<ContactSettings>,
): Promise<ContactSettings> {
  if (!isDatabaseConfigured()) {
    throw new Error('Database is not configured');
  }

  if (partial.email !== undefined) {
    await db
      .insert(siteSettings)
      .values({ key: 'contact_email', value: partial.email })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: partial.email, updatedAt: new Date() },
      });
  }

  if (partial.linkedin !== undefined) {
    await db
      .insert(siteSettings)
      .values({ key: 'contact_linkedin', value: partial.linkedin })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: partial.linkedin, updatedAt: new Date() },
      });
  }

  return getContactSettings();
}
