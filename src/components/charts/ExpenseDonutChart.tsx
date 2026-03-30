"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useChartColors } from "@/hooks/useChartColors";

interface CategoryData {
  categoria: string;
  total: number;
}

interface ExpenseDonutChartProps {
  data: CategoryData[];
}

export function ExpenseDonutChart({ data }: ExpenseDonutChartProps) {
  const c = useChartColors();

  const CHART_COLORS = [
    c.chart1,
    c.chart2,
    c.chart3,
    c.chart4,
    c.chart5,
    "hsl(200 70% 50%)",
    "hsl(50 90% 55%)",
    "hsl(340 70% 55%)",
    "hsl(180 55% 45%)",
  ];

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoria,
    value: d.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: c.tooltipBg,
            border: `1px solid ${c.tooltipBorder}`,
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number) => [`Q${value.toFixed(2)}`, ""]}
        />
        <Legend
          formatter={(value) => value}
          wrapperStyle={{ fontSize: 11, color: c.tick }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
