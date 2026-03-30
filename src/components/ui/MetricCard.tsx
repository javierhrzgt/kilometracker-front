"use client";

import { ReactNode } from "react";
import { StatCard } from "@/components/features/stats/StatCard";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
}

/**
 * @deprecated Use StatCard from @/components/features/stats/StatCard instead.
 * StatCard supports icon, trend, accent, subtitle and size in a unified API.
 */
export function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <StatCard
      label={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      trend={trend}
    />
  );
}
