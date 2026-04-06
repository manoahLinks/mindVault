import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/5 border border-white/5",
        className
      )}
    />
  );
}

export function ResourceSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl h-[280px]">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-7 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
    </div>
  );
}
