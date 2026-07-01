import { db } from '@/db';
import { blogs, projects, canvasBlocks } from '@/db/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { queryDb } from '@/lib/db-safe';
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
- **Ship small** — a button and an input done well beats a sprawling library nobody uses.

[Read more on Figma's best practices](https://www.figma.com/best-practices/components-styles-and-shared-libraries/) for component libraries.`,
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

Sharing drafts, failures, and small wins in the open has changed how I ship:

1. Feedback arrives while the idea is still flexible.
2. Accountability replaces perfectionism.
3. The portfolio writes itself.

Start with something small — a screenshot, a paragraph, a link.`,
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

export async function getPublishedBlogs(): Promise<ListCardData[]> {
  return queryDb(async () => {
    const rows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.isPublished, true))
      .orderBy(
        desc(sql`coalesce(${blogs.publishedAt}, ${blogs.createdAt})`),
      );

    if (rows.length === 0) return DEMO_BLOGS;

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
  }, DEMO_BLOGS);
}

export async function getWorksList(): Promise<ListCardData[]> {
  return queryDb(async () => {
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

    const mapped = rows
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

    return mapped.length > 0 ? mapped : DEMO_WORKS;
  }, DEMO_WORKS);
}

export async function getProjectsList(): Promise<ListCardData[]> {
  return queryDb(async () => {
    const rows = await db
      .select()
      .from(projects)
      .orderBy(
        desc(sql`coalesce(${projects.displayYear}, 0)`),
        desc(sql`coalesce(${projects.displayMonth}, 0)`),
        asc(projects.priorityOrder),
      );

    if (rows.length === 0) return DEMO_PROJECTS;

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
  }, DEMO_PROJECTS);
}
