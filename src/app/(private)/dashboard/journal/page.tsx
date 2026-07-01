import { db } from '@/db';
import { journal } from '@/db/schema';
import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import JournalView from '@/components/private/JournalView';
import { queryDb } from '@/lib/db-safe';
import type { JournalEntry } from '@/db/schema';

export const metadata: Metadata = { title: 'Journal — Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardJournalPage() {
  const entries = await queryDb(
    () => db.select().from(journal).orderBy(desc(journal.createdAt)),
    [] as JournalEntry[],
  );

  return (
    <div>
      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">Private</p>
      <h1 className="text-2xl font-semibold text-primary mb-8">Journal</h1>
      <JournalView initialEntries={entries} />
    </div>
  );
}
