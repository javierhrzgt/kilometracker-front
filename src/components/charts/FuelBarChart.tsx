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

interface DataPoint {
  period: string;
  label: string;
  value: number;
}

interface FuelBarChartProps {
  data: DataPoint[];
}

export function FuelBarChart({ data }: FuelBarChartProps) {
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
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(215.4 16.3% 46.9%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(215.4 16.3% 46.9%)" }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(0 0% 100%)",
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Combustible"]}
          cursor={{ fill: "hsl(214.3 31.8% 91.4% / 0.4)" }}
        />
        <Bar
          dataKey="value"
          fill="hsl(160 60% 45%)"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
