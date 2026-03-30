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
  label: string;
  value: number;
}

interface MaintenanceCostBarChartProps {
  data: DataPoint[];
}

export function MaintenanceCostBarChart({ data }: MaintenanceCostBarChartProps) {
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
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "hsl(215.4 16.3% 46.9%)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(215.4 16.3% 46.9%)" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(0 0% 100%)",
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Costo"]}
          cursor={{ fill: "hsl(214.3 31.8% 91.4% / 0.4)" }}
        />
        <Bar
          dataKey="value"
          fill="hsl(280 65% 60%)"
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
