"use client";

import {
  AreaChart,
  Area,
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

interface KmAreaChartProps {
  data: DataPoint[];
}

export function KmAreaChart({ data }: KmAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(239 84% 67%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(v) => `${v} km`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(0 0% 100%)",
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number) => [`${value.toFixed(1)} km`, "Distancia"]}
          labelFormatter={(label) => label}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(239 84% 67%)"
          strokeWidth={2}
          fill="url(#kmGradient)"
          dot={{ r: 3, fill: "hsl(239 84% 67%)" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
