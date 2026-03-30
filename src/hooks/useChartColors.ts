"use client";

import { useState, useEffect } from "react";

export interface ChartColors {
  grid: string;
  tick: string;
  tooltipBg: string;
  tooltipBorder: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

const LIGHT_FALLBACK: ChartColors = {
  grid: "hsl(214.3 31.8% 91.4%)",
  tick: "hsl(215.4 16.3% 46.9%)",
  tooltipBg: "hsl(0 0% 100%)",
  tooltipBorder: "hsl(214.3 31.8% 91.4%)",
  chart1: "hsl(239 84% 67%)",
  chart2: "hsl(160 60% 45%)",
  chart3: "hsl(30 80% 55%)",
  chart4: "hsl(280 65% 60%)",
  chart5: "hsl(10 75% 58%)",
};

function readCSSColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  const get = (variable: string, fallback: string) =>
    style.getPropertyValue(variable).trim() || fallback;

  return {
    grid: get("--color-border", LIGHT_FALLBACK.grid),
    tick: get("--color-muted-foreground", LIGHT_FALLBACK.tick),
    tooltipBg: get("--color-card", LIGHT_FALLBACK.tooltipBg),
    tooltipBorder: get("--color-border", LIGHT_FALLBACK.tooltipBorder),
    chart1: get("--color-chart-1", LIGHT_FALLBACK.chart1),
    chart2: get("--color-chart-2", LIGHT_FALLBACK.chart2),
    chart3: get("--color-chart-3", LIGHT_FALLBACK.chart3),
    chart4: get("--color-chart-4", LIGHT_FALLBACK.chart4),
    chart5: get("--color-chart-5", LIGHT_FALLBACK.chart5),
  };
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(LIGHT_FALLBACK);

  useEffect(() => {
    setColors(readCSSColors());

    const observer = new MutationObserver(() => {
      setColors(readCSSColors());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}
