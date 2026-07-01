import type { Metadata } from 'next';
import ListPageLayout from '@/components/public/list/ListPageLayout';
import LinkListSection from '@/components/public/list/LinkListSection';
import { getProjectsList } from '@/lib/list-content';

export const metadata: Metadata = { title: 'Projects' };

const THEME = '#F5C5FF';

export default async function ProjectsPage() {
  const items = await getProjectsList();

  return (
    <ListPageLayout title="projects" themeColor={THEME}>
      <LinkListSection
        items={items}
        themeColor={THEME}
        emptyLabel="No projects listed yet."
        pageType="projects"
      />
    </ListPageLayout>
  );
}
