import { db } from '@/db';
import { blogs, projects, journal, messages, siteVisits } from '@/db/schema';
import { eq, sql, gte } from 'drizzle-orm';
import type { Metadata } from 'next';
import { queryDb } from '@/lib/db-safe';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const EMPTY_STATS = {
  totalBlogs: 0,
  publishedBlogs: 0,
  totalProjects: 0,
  totalEntries: 0,
  unreadMessages: 0,
  totalVisits: 0,
  weekVisits: 0,
};

async function loadStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    [{ count: totalBlogs }],
    [{ count: publishedBlogs }],
    [{ count: totalProjects }],
    [{ count: totalEntries }],
    [{ count: unreadMessages }],
    [{ count: totalVisits }],
    [{ count: weekVisits }],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(blogs),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogs)
      .where(eq(blogs.isPublished, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(projects),
    db.select({ count: sql<number>`count(*)::int` }).from(journal),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(eq(messages.isRead, false)),
    db.select({ count: sql<number>`count(*)::int` }).from(siteVisits),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(siteVisits)
      .where(gte(siteVisits.visitedAt, weekAgo)),
  ]);

  return {
    totalBlogs,
    publishedBlogs,
    totalProjects,
    totalEntries,
    unreadMessages,
    totalVisits,
    weekVisits,
  };
}

export default async function DashboardPage() {
  const {
    totalBlogs,
    publishedBlogs,
    totalProjects,
    totalEntries,
    unreadMessages,
    totalVisits,
    weekVisits,
  } = await queryDb(loadStats, EMPTY_STATS);

  const stats = [
    { label: 'Site Visits', value: totalVisits, sub: `${weekVisits} this week` },
    { label: 'Blog Posts', value: totalBlogs, sub: `${publishedBlogs} published` },
    { label: 'Projects', value: totalProjects, sub: 'on record' },
    { label: 'Journal Entries', value: totalEntries, sub: 'private' },
    {
      label: 'Unread Messages',
      value: unreadMessages,
      sub: 'in inbox',
      highlight: unreadMessages > 0,
    },
  ];

  return (
    <div>
      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-2">Overview</p>
      <h1 className="text-2xl font-semibold text-primary mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, sub, highlight }) => (
          <div
            key={label}
            className={`card ${highlight ? 'border-accent/40 bg-accent-glow' : ''}`}
          >
            <p className="text-3xl font-semibold text-bright mb-1">{value}</p>
            <p className="text-xs font-medium text-primary">{label}</p>
            <p className="text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card max-w-sm">
        <p className="text-xs font-mono text-subtle uppercase tracking-widest mb-1">System</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
          <span className="text-xs text-secondary">All services operational</span>
        </div>
      </div>
    </div>
  );
}
