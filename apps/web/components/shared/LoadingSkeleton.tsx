import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Single line skeleton */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-[12px]", className)}
      aria-hidden="true"
    />
  );
}

/** Full page loading state */
export function PageSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#f3fbfd] px-6 py-10 mx-auto max-w-2xl space-y-5"
      aria-busy="true"
      aria-label="Loading page"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/** Card skeleton */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div
      className="surface p-5 space-y-3"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Chat message skeletons */
export function ChatSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading conversation"
    >
      {/* AI message */}
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <Skeleton className="h-16 w-64 rounded-[20px]" />
      </div>
      {/* User message */}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-10 w-48 rounded-[20px]" />
      </div>
      {/* AI message */}
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <Skeleton className="h-20 w-72 rounded-[20px]" />
      </div>
    </div>
  );
}

/** Dashboard stats skeleton */
export function StatsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      aria-busy="true"
      aria-label="Loading statistics"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="surface p-5 space-y-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Result card skeleton */
export function ResultSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading your result"
    >
      <div className="rounded-[24px] border-2 border-[#e5e7eb] bg-white p-6 space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <CardSkeleton lines={4} />
      <CardSkeleton lines={3} />
    </div>
  );
}
