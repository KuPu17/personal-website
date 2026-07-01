import { db } from '@/db';
import { canvasBlocks } from '@/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import CanvasBlocksManager from '@/components/private/CanvasBlocksManager';
import { queryDb } from '@/lib/db-safe';
import type { CanvasBlock } from '@/db/schema';

export const metadata: Metadata = { title: 'Works' };
export const dynamic = 'force-dynamic';

export default async function WorksDashboardPage() {
  const blocks = await queryDb(
    () =>
      db
        .select()
        .from(canvasBlocks)
        .where(
          and(
            eq(canvasBlocks.blockType, 'website'),
          ),
        )
        .orderBy(asc(canvasBlocks.spawnOrder)),
    [] as CanvasBlock[],
  );

  return (
    <div>
      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-2">
        Public site
      </p>
      <h1 className="text-2xl font-semibold text-primary mb-2">Works</h1>
      <p className="text-subtle text-sm mb-8 max-w-xl">
        Manage external links shown on the <code className="text-muted">/works</code> page.
        You can also add or edit entries in controller mode on the live site.
      </p>
      <CanvasBlocksManager initialBlocks={blocks} />
    </div>
  );
}
