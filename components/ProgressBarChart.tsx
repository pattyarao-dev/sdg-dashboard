"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ProgressBarChartProps {
  label: string;
  progress: number; 
}

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({ label, progress }) => {
  const data: Data[] = [
    {
      x: [progress], // Progress value
      y: [label], // Indicator name
      type: "bar",
      orientation: "h",
      marker: { color: "#1e90ff" },
    },
  ];

  const layout: Partial<Layout> = {
    title: "Indicator Progress",
    barmode: "stack",
  };

  return <Plot data={data} layout={layout} />;
};

export default ProgressBarChart;
