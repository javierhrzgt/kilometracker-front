"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground truncate">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                {trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                {trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                {trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
