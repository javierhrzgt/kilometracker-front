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
import { useChartColors } from "@/hooks/useChartColors";

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
  const c = useChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  const avg = data.reduce((sum, d) => sum + d.kmPorLitro, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
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
          width={45}
          tickFormatter={(v) => `${v}`}
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
              return [`${num.toFixed(2)} km/L`, "Eficiencia"];
            }}
        />
        <ReferenceLine
          y={parseFloat(avg.toFixed(2))}
          stroke={c.chart3}
          strokeDasharray="4 3"
          label={{ value: `Prom: ${avg.toFixed(1)}`, fill: c.chart3, fontSize: 10 }}
        />
        <Line
          type="monotone"
          dataKey="kmPorLitro"
          stroke={c.chart1}
          strokeWidth={2}
          dot={{ r: 3, fill: c.chart1 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
