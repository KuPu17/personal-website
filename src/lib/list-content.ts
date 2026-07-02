import { db } from '@/db';
import { blogs, projects, canvasBlocks } from '@/db/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { isDatabaseConfigured } from '@/lib/db-safe';
import { DEMO_WORKS_RAW, DEMO_PROJECTS_RAW } from '@/lib/demo-blocks';

export type ListCardData = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  href?: string | null;
  slug?: string | null;
  contentMd?: string | null;
  isPrivate?: boolean;
  publishedAt?: string | null;
  displayMonth?: number | null;
  displayYear?: number | null;
};

function markdownExcerpt(md: string, maxLen = 160): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`>_~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain;
}

function pickProjectHref(project: {
  demoUrl: string | null;
  githubUrl: string | null;
  huggingfaceUrl: string | null;
}): string | null {
  return project.demoUrl ?? project.githubUrl ?? project.huggingfaceUrl ?? null;
}

const DEMO_BLOGS: ListCardData[] = [
  {
    id: 'demo-blog-1',
    title: 'Design Systems Notes',
    slug: 'design-systems-notes',
    publishedAt: '2025-11-14T00:00:00.000Z',
    description:
      'Notes on tokens, components, and keeping a visual language consistent across products.',
    contentMd: `## Design Systems

A few things I keep coming back to when building UI:

- **Tokens first** — color, spacing, and type scales before components.
- **One source of truth** — document decisions where designers and devs both look.
- **Ship small** — a button and an input done well beats a sprawling library nobody uses.`,
    imageUrl: null,
  },
  {
    id: 'demo-blog-2',
    title: 'On Building in Public',
    slug: 'building-in-public',
    publishedAt: '2025-08-03T00:00:00.000Z',
    description:
      'Why sharing work early helps you learn faster and attract the right collaborators.',
    contentMd: `## Building in Public

Sharing drafts, failures, and small wins in the open has changed how I ship.`,
    imageUrl: null,
  },
];

const DEMO_WORKS: ListCardData[] = DEMO_WORKS_RAW.map((block, index) => ({
  id: block.id,
  title: block.label,
  href: block.externalUrl,
  description: null,
  imageUrl: null,
  displayMonth: 6 - index,
  displayYear: 2025,
}));

const DEMO_PROJECTS: ListCardData[] = DEMO_PROJECTS_RAW.map((block, index) => ({
  id: block.id,
  title: block.label,
  description: 'A featured build — connect a database entry for full details.',
  href: block.githubUrl ?? block.huggingfaceUrl,
  imageUrl: null,
  displayMonth: 5 - index,
  displayYear: 2025,
}));

async function queryList<T>(
  label: string,
  demo: T[],
  query: () => Promise<T[]>,
): Promise<T[]> {
  if (!isDatabaseConfigured()) return demo;
  try {
    return await query();
  } catch (error) {
    console.error(`[DB] ${label} failed:`, error);
    return [];
  }
}

export async function getPublishedBlogs(): Promise<ListCardData[]> {
  return queryList('getPublishedBlogs', DEMO_BLOGS, async () => {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.isPublished, true))
      .orderBy(
        desc(sql`coalesce(${blogs.publishedAt}, ${blogs.createdAt})`),
      );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: markdownExcerpt(row.contentMd) || null,
      imageUrl: row.coverImageUrl,
      contentMd: row.contentMd,
      isPrivate: !row.isPublished,
      publishedAt: (row.publishedAt ?? row.createdAt)?.toISOString() ?? null,
    }));
  });
}

export async function getWorksList(): Promise<ListCardData[]> {
  return queryList('getWorksList', DEMO_WORKS, async () => {
    const rows = await db
      .select()
      .from(canvasBlocks)
      .where(
        and(
          eq(canvasBlocks.isVisible, true),
          eq(canvasBlocks.blockType, 'website'),
        ),
      )
      .orderBy(
        desc(sql`coalesce(${canvasBlocks.displayYear}, 0)`),
        desc(sql`coalesce(${canvasBlocks.displayMonth}, 0)`),
        asc(canvasBlocks.spawnOrder),
      );

    return rows
      .filter((row) => row.externalUrl)
      .map((row) => ({
        id: row.id,
        title: row.label,
        href: row.externalUrl,
        description: row.description,
        imageUrl: row.coverImageUrl,
        displayMonth: row.displayMonth,
        displayYear: row.displayYear,
      }));
  });
}

export async function getProjectsList(): Promise<ListCardData[]> {
  return queryList('getProjectsList', DEMO_PROJECTS, async () => {
    const rows = await db
      .select()
      .from(projects)
      .orderBy(
        desc(sql`coalesce(${projects.displayYear}, 0)`),
        desc(sql`coalesce(${projects.displayMonth}, 0)`),
        asc(projects.priorityOrder),
      );

    return rows
      .map((row) => ({
        id: row.id,
        title: row.name,
        description: row.description,
        imageUrl: row.coverImageUrl,
        href: pickProjectHref(row),
        displayMonth: row.displayMonth,
        displayYear: row.displayYear,
      }))
      .filter((row) => row.href);
  });
}

export function isUsingDemoListData(items: ListCardData[]): boolean {
  return (
    !isDatabaseConfigured() &&
    items.length > 0 &&
    items.every((item) => item.id.startsWith('demo-'))
  );
}
