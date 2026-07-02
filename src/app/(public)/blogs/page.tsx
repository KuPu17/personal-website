import type { Metadata } from 'next';
import ListPageLayout from '@/components/public/list/ListPageLayout';
import BlogListSection from '@/components/public/list/BlogListSection';
import { getPublishedBlogs, isUsingDemoListData } from '@/lib/list-content';

export const metadata: Metadata = { title: 'Blogs' };
export const dynamic = 'force-dynamic';

const THEME = '#FFFB9B';

export default async function BlogsPage() {
  const items = await getPublishedBlogs();

  return (
    <ListPageLayout title="blogs" themeColor={THEME}>
      <BlogListSection
        items={items}
        themeColor={THEME}
        showDemoNotice={isUsingDemoListData(items)}
      />
    </ListPageLayout>
  );
}
