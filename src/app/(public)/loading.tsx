import { SkeletonBar, SkeletonCard } from '@/components/shared/Skeleton';

export default function PublicLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* Hero skeleton */}
      <div className="space-y-4">
        <SkeletonBar className="w-24 h-3" />
        <SkeletonBar className="w-2/3 h-10" />
        <SkeletonBar className="w-1/2 h-10" />
        <SkeletonBar className="w-96 h-5" />
        <div className="flex gap-3 pt-2">
          <SkeletonBar className="w-28 h-9 rounded" />
          <SkeletonBar className="w-24 h-9 rounded" />
        </div>
      </div>

      {/* Projects skeleton */}
      <div className="space-y-6">
        <SkeletonBar className="w-32 h-7" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
