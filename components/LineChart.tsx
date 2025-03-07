"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Layout, ScatterData } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface LineChartProps {
  data: ScatterData[]; // Expecting ScatterData[] type for the chart data
  // target: number; // Target value for the SDG
  onClick: (event: any) => void; // Add onClick prop to handle the clicked year
}

const LineChart: React.FC<LineChartProps> = ({ data, target, onClick }) => {
  if (!data || data.length === 0 || !data[0]?.x) return null;

  // Create the target line data
  // const targetLine: ScatterData = {
  //   x: data[0]?.x, // Use x-values (years) from the main progress data
  //   y: new Array(data[0]?.x.length).fill(target), // Repeat the target value for all years
  //   type: "scatter",
  //   mode: "lines",
  //   name: "Target",
  //   line: { dash: "solid", color: "black", width: 2 }, // Dashed black target line
  // };

  // Layout configuration
  const layout: Partial<Layout> = {
    xaxis: {
      title: "Year",
      tickmode: "linear",
      dtick: 1,
      tickformat: "d",
    },
    yaxis: {
      title: "Progress",
      range: [0, 100],
      dtick: 10,
    },
    showlegend: true,
  };

  return (
    <Plot
      data={[...data, targetLine]}
      layout={layout}
      onClick={onClick}
    />
  );
};

export default LineChart;
