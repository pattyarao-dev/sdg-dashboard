"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface GaugeChartProps {
  title: string;
  value: number;
  color?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ title, value, color = "#f44336" }) => {
  const data: Data[] = [
    {
      type: "indicator",
      mode: "gauge+number",
      value,
      title: { text: `SDG ${title}`, font: { size: 14 } },
      gauge: {
        axis: { range: [0, 100] },
        bar: { color },
      },
    },
  ];

  const layout: Partial<Layout> = {
    width: 200,
    height: 150,
    margin: { t: 10, b: 10, l: 10, r: 10 },
  };

  return <Plot data={data} layout={layout} />;
};

export default GaugeChart;
