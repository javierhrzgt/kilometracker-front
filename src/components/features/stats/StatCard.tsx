import { ReactNode } from "react";

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
    <div
      className={`border border-border rounded-lg p-4 sm:p-6 bg-card shadow-sm hover:shadow-depth-2 transition-elevation ${className}`}
    >
      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wide">
        {label}
      </p>
      {children || (
        <p className={`${valueSize} font-light text-foreground`}>
          {value}
          {unit && (
            <span className={`${unitSize} text-muted-foreground ml-1`}>
              {unit}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
