import { db } from '@/db';
import { messages } from '@/db/schema';
import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import MessagesInbox from '@/components/private/MessagesInbox';
import { queryDb } from '@/lib/db-safe';
import type { Message } from '@/db/schema';

export const metadata: Metadata = { title: 'Messages — Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardMessagesPage() {
  const allMessages = await queryDb(
    () => db.select().from(messages).orderBy(desc(messages.createdAt)),
    [] as Message[],
  );

  return (
    <div>
      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">Inbox</p>
      <h1 className="text-2xl font-semibold text-primary mb-8">Anonymous Messages</h1>
      <MessagesInbox initialMessages={allMessages} />
    </div>
  );
}
