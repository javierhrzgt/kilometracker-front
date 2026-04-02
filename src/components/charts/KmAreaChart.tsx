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
import { useChartColors } from "@/hooks/useChartColors";

interface DataPoint {
  period: string;
  label: string;
  value: number;
}

interface KmAreaChartProps {
  data: DataPoint[];
  compact?: boolean;
}

export function KmAreaChart({ data, compact = false }: KmAreaChartProps) {
  const c = useChartColors();

  if (!data || data.length === 0) {
    if (compact) return null;
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  if (compact) {
    return (
      <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="kmGradientCompact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={c.chart1} stopOpacity={0.3} />
              <stop offset="95%" stopColor={c.chart1} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={c.chart1}
            strokeWidth={2}
            fill="url(#kmGradientCompact)"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={c.chart1} stopOpacity={0.25} />
            <stop offset="95%" stopColor={c.chart1} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(v) => `${v} km`}
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
              return [`${num.toFixed(1)} km`, "Distancia"];
            }}
          labelFormatter={(label) => label}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={c.chart1}
          strokeWidth={2}
          fill="url(#kmGradient)"
          dot={{ r: 3, fill: c.chart1 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
