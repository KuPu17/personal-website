import { db } from '@/db';
import { projects } from '@/db/schema';
import { asc } from 'drizzle-orm';
import type { Metadata } from 'next';
import ProjectsManager from '@/components/private/ProjectsManager';
import { queryDb } from '@/lib/db-safe';
import type { Project } from '@/db/schema';

export const metadata: Metadata = { title: 'Projects — Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardProjectsPage() {
  const allProjects = await queryDb(
    () => db.select().from(projects).orderBy(asc(projects.priorityOrder)),
    [] as Project[],
  );

  return (
    <div>
      <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">CMS</p>
      <h1 className="text-2xl font-semibold text-primary mb-8">Projects</h1>
      <ProjectsManager initialProjects={allProjects} />
    </div>
  );
}
