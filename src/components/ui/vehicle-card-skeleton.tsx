import { Skeleton } from "@/components/ui/skeleton";

export function VehicleCardSkeleton() {
  return (
    <div className="border rounded-lg p-5 shadow-sm bg-card border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="ml-3">
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
