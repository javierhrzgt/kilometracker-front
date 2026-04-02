"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useChartColors } from "@/hooks/useChartColors";

interface DataPoint {
  label: string;
  period: string;
  costo: number;
  kmPorLitro: number;
}

interface FuelComposedChartProps {
  data: DataPoint[];
}

export function FuelComposedChart({ data }: FuelComposedChartProps) {
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
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => `Q${v}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: c.tick }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: c.tooltipBg,
            border: `1px solid ${c.tooltipBorder}`,
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value, name) => {
              const num = typeof value === "number" ? value : 0;
              return name === "costo"
                ? [`Q${num.toFixed(2)}`, "Costo combustible"]
                : [`${num.toFixed(2)} km/L`, "Eficiencia"];
            }}
        />
        <Legend
          formatter={(value) =>
            value === "costo" ? "Costo combustible" : "Eficiencia (km/L)"
          }
          wrapperStyle={{ fontSize: 11, color: c.tick }}
        />
        <Bar
          yAxisId="left"
          dataKey="costo"
          fill={c.chart2}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="kmPorLitro"
          stroke={c.chart1}
          strokeWidth={2}
          dot={{ r: 3, fill: c.chart1 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
