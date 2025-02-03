"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface GaugeChartProps {
  title: string;
  value: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ title, value }) => {
  
  const getGaugeColor = (percentage: number) => {
    if (percentage < 50) return "#E5243B"; // Red (0-49%)
    if (percentage < 80) return "#FF9800"; // Orange (50-79%)
    return "#4CAF50"; // Green (80-100%)
  };

  const color = getGaugeColor(value);

  const data: Data[] = [
    {
      type: "indicator",
      mode: "gauge+number",
      value,
      number: { suffix: "%" },
      title: { text: `${title}`, font: { size: 12 } },
      gauge: {
        axis: { range: [0, 100] },
        bar: { color },
      },
    },
  ];

  const layout: Partial<Layout> = {
    width: 200,
    height: 150,
    margin: { t: 40, b: 10, l: 10, r: 10 },
    // annotations: [
    //   {
    //     x: 0.5,
    //     y: -0.2, // Positioning below the gauge
    //     xref: "paper",
    //     yref: "paper",
    //     showarrow: false,
    //     font: { size: 12, color: "black" },
    //   },
    // ],
  };

  return <Plot data={data} layout={layout} />;
};

export default GaugeChart;
