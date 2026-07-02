import type { Metadata } from 'next';
import ListPageLayout from '@/components/public/list/ListPageLayout';
import LinkListSection from '@/components/public/list/LinkListSection';
import { getWorksList, isUsingDemoListData } from '@/lib/list-content';

export const metadata: Metadata = { title: 'Works' };

const THEME = '#FFE697';

export default async function WorksPage() {
  const items = await getWorksList();

  return (
    <ListPageLayout title="works" themeColor={THEME}>
      <LinkListSection
        items={items}
        themeColor={THEME}
        emptyLabel="No works listed yet."
        pageType="works"
        showDemoNotice={isUsingDemoListData(items)}
      />
    </ListPageLayout>
  );
}
