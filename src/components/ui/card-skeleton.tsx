import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  /** Number of skeleton rows to show inside the card */
  rows?: number;
}

/** Loading skeleton for table/list sections. Replaces bare "Cargando..." text. */
export function CardSkeleton({ rows = 5 }: CardSkeletonProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-8 w-1/3 mb-4" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
