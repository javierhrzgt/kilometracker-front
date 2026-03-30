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
  label: string;
  value: number;
}

interface MaintenanceCostBarChartProps {
  data: DataPoint[];
}

export function MaintenanceCostBarChart({ data }: MaintenanceCostBarChartProps) {
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
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `Q${v}`}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: c.tooltipBg,
            border: `1px solid ${c.tooltipBorder}`,
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number) => [`Q${value.toFixed(2)}`, "Costo"]}
          cursor={{ fill: `${c.grid}66` }}
        />
        <Bar
          dataKey="value"
          fill={c.chart4}
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
