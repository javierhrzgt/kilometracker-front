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
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(215.4 16.3% 46.9%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: "hsl(215.4 16.3% 46.9%)" }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => `$${v}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: "hsl(215.4 16.3% 46.9%)" }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(0 0% 100%)",
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number, name: string) =>
            name === "costo"
              ? [`$${value.toFixed(2)}`, "Costo combustible"]
              : [`${value.toFixed(2)} km/L`, "Eficiencia"]
          }
        />
        <Legend
          formatter={(value) =>
            value === "costo" ? "Costo combustible" : "Eficiencia (km/L)"
          }
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar
          yAxisId="left"
          dataKey="costo"
          fill="hsl(160 60% 45%)"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="kmPorLitro"
          stroke="hsl(239 84% 67%)"
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(239 84% 67%)" }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
