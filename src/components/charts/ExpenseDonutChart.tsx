"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CHART_COLORS = [
  "hsl(239 84% 67%)",
  "hsl(160 60% 45%)",
  "hsl(30 80% 55%)",
  "hsl(280 65% 60%)",
  "hsl(10 75% 58%)",
  "hsl(200 70% 50%)",
  "hsl(50 90% 55%)",
  "hsl(340 70% 55%)",
  "hsl(180 55% 45%)",
];

interface CategoryData {
  categoria: string;
  total: number;
}

interface ExpenseDonutChartProps {
  data: CategoryData[];
}

export function ExpenseDonutChart({ data }: ExpenseDonutChartProps) {
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
            backgroundColor: "hsl(0 0% 100%)",
            border: "1px solid hsl(214.3 31.8% 91.4%)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
        />
        <Legend
          formatter={(value) => value}
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
