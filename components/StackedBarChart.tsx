"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface StackedBarChartProps {
  categories: string[];
  values: number[][];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ categories, values }) => {
  const traces: Data[] = values.map((val, index) => ({
    x: val,
    y: categories,
    type: "bar",
    name: `Sub-Indicator ${index + 1}`,
    orientation: "h",
  }));

  const layout: Partial<Layout> = {
    title: "Sub-Indicator Breakdown",
    barmode: "stack",
  };

  return <Plot data={traces} layout={layout} />;
};

export default StackedBarChart;
