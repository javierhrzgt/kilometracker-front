import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}

export function StatCard({
  label,
  value,
  unit,
  size = "lg",
  className = "",
  children,
}: StatCardProps) {
  const valueSize = {
    sm: "text-xl sm:text-2xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-2xl sm:text-4xl",
  }[size];

  const unitSize = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-sm sm:text-xl",
  }[size];

  return (
    <Card className={cn("hover:shadow-depth-2 transition-elevation", className)}>
      <CardContent className="p-4 sm:p-6">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wide">
          {label}
        </p>
        {children || (
          <p className={cn(valueSize, "font-light text-foreground")}>
            {value}
            {unit && (
              <span className={cn(unitSize, "text-muted-foreground ml-1")}>
                {unit}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
