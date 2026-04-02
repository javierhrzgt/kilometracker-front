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
  grid: "hsl(218 18% 88%)",
  tick: "hsl(218 12% 46%)",
  tooltipBg: "hsl(0 0% 100%)",
  tooltipBorder: "hsl(218 18% 88%)",
  chart1: "hsl(218 60% 50%)",
  chart2: "hsl(158 52% 42%)",
  chart3: "hsl(43 72% 49%)",
  chart4: "hsl(210 35% 55%)",
  chart5: "hsl(358 55% 50%)",
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
  const [colors, setColors] = useState<ChartColors>(() => {
    if (typeof document === "undefined") return LIGHT_FALLBACK;
    return readCSSColors();
  });

  useEffect(() => {
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
