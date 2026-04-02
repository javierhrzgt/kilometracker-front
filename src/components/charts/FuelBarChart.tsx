"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useChartColors } from "@/hooks/useChartColors";

interface DataPoint {
  period: string;
  label: string;
  value: number;
}

interface FuelBarChartProps {
  data: DataPoint[];
}

export function FuelBarChart({ data }: FuelBarChartProps) {
  const c = useChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => `Q${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: c.tooltipBg,
            border: `1px solid ${c.tooltipBorder}`,
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value) => {
              const num = typeof value === "number" ? value : 0;
              return [`Q${num.toFixed(2)}`, "Combustible"];
            }}
          cursor={{ fill: `${c.grid}66` }}
        />
        <Bar
          dataKey="value"
          fill={c.chart2}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
