import { SkeletonBar, SkeletonTableRow } from '@/components/shared/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SkeletonBar className="w-20 h-3" />
        <SkeletonBar className="w-40 h-7" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-2">
            <SkeletonBar className="w-10 h-8" />
            <SkeletonBar className="w-24 h-4" />
            <SkeletonBar className="w-16 h-3" />
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
