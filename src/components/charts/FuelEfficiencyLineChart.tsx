"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface EficienciaPoint {
  period: string;
  label: string;
  kmPorLitro: number;
  costoPorKm: number;
}

interface FuelEfficiencyLineChartProps {
  data: EficienciaPoint[];
}

export function FuelEfficiencyLineChart({ data }: FuelEfficiencyLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  const avg =
    data.reduce((sum, d) => sum + d.kmPorLitro, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
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
          width={45}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(0 0% 100%)",
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number) => [`${value.toFixed(2)} km/L`, "Eficiencia"]}
        />
        <ReferenceLine
          y={parseFloat(avg.toFixed(2))}
          stroke="hsl(38 92% 50%)"
          strokeDasharray="4 3"
          label={{ value: `Prom: ${avg.toFixed(1)}`, fill: "hsl(38 92% 50%)", fontSize: 10 }}
        />
        <Line
          type="monotone"
          dataKey="kmPorLitro"
          stroke="hsl(239 84% 67%)"
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(239 84% 67%)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
