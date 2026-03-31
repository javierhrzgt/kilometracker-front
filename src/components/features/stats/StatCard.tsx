"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "info" | "warning" | "success" | "purple" | "destructive";

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  accent?: Accent;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}

const accentClass: Record<Accent, string> = {
  info:        "text-info",
  warning:     "text-warning",
  success:     "text-success",
  purple:      "text-purple",
  destructive: "text-destructive",
};

const accentBorder: Record<Accent, string> = {
  info:        "border-l-4 border-l-info",
  warning:     "border-l-4 border-l-warning",
  success:     "border-l-4 border-l-success",
  purple:      "border-l-4 border-l-purple",
  destructive: "border-l-4 border-l-destructive",
};

const accentIconClass: Record<Accent, string> = {
  info:        "bg-info/10 text-info",
  warning:     "bg-warning/10 text-warning",
  success:     "bg-success/10 text-success",
  purple:      "bg-purple/10 text-purple",
  destructive: "bg-destructive/10 text-destructive",
};

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "neutral" }) => {
  if (trend === "up")      return <TrendingUp className="h-3 w-3 text-success" />;
  if (trend === "down")    return <TrendingDown className="h-3 w-3 text-destructive" />;
  if (trend === "neutral") return <Minus className="h-3 w-3 text-muted-foreground" />;
  return null;
};

export function StatCard({
  label,
  value,
  unit,
  subtitle,
  icon,
  trend,
  accent,
  size = "lg",
  className = "",
  children,
}: StatCardProps) {
  const valueColor = accent ? accentClass[accent] : "text-foreground";

  // Icon layout — matches former MetricCard style
  if (icon) {
    return (
      <Card className={cn("hover:shadow-depth-2 transition-elevation", accent && accentBorder[accent], className)}>
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2 leading-snug">{label}</p>
              <p className={cn("mt-1 text-xl sm:text-2xl font-bold leading-tight", valueColor)}>{value}</p>
              {subtitle && (
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <TrendIcon trend={trend} />
                  {subtitle}
                </p>
              )}
            </div>
            <div className={cn("p-2.5 rounded-lg shrink-0", accent ? accentIconClass[accent] : "bg-primary/10 text-primary")}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Base layout — stacked label + value
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
    <Card className={cn("hover:shadow-depth-2 transition-elevation", accent && accentBorder[accent], className)}>
      <CardContent className="p-4 sm:p-6">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wide truncate">
          {label}
        </p>
        {children || (
          <>
            <p className={cn(valueSize, "font-light", valueColor)}>
              {value}
              {unit && (
                <span className={cn(unitSize, "text-muted-foreground ml-1")}>
                  {unit}
                </span>
              )}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <TrendIcon trend={trend} />
                {subtitle}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
