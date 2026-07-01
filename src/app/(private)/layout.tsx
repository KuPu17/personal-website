import { getSession } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db-safe';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/private/DashboardSidebar';
import DbOfflineNotice from '@/components/private/DbOfflineNotice';

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/');

  return (
    <div className="dashboard-root flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 ml-60 min-h-screen bg-canvas">
        <main className="max-w-5xl mx-auto px-8 py-10">
          {!isDatabaseConfigured() && <DbOfflineNotice />}
          {children}
        </main>
      </div>
    </div>
  );
}
