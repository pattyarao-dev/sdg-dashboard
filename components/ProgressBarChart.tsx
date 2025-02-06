"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ProgressBarChartProps {
  label: string;
  progress: number; // Current progress (in %)
  target: number; // Target value (in %)
  onClick?: () => void;
  
}

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({ label, progress, target, onClick }) => {
  const data: Data[] = [
    {
      x: [progress], // Progress value
      y: [label], // Indicator name
      type: "bar",
      orientation: "h",
      marker: { color: "#1e90ff" }, // Blue for progress
    },
    {
      x: [100 - progress], // Empty space to 100%
      y: [label], // Same label
      type: "bar",
      orientation: "h",
      marker: { color: "#d3d3d3" }, // Light gray for remaining space
    },
  ];

  const layout: Partial<Layout> = {
    height: 50, // Adjust height to make bars thinner
    margin: { l: 150, r: 10, t: 10, b: 20 }, // Left margin for labels
    barmode: "stack", // Stack progress and empty space
    showlegend: false, // Hide legend for cleaner look
    xaxis: { range: [0, 100], showgrid: false }, // Always scale from 0-100%
    yaxis: { 
      tickmode: "array", // Ensure labels don't shift
      automargin: true, // Auto space labels correctly
      side: "left", // Force labels to align left
    },
    shapes: [
      {
        type: "line",
        x0: target,
        x1: target,
        y0: -0.5,
        y1: 0.5,
        line: {
          color: "red", // Target marker color
          width: 3,
          dash: "dashdot", // Makes it a dashed line
        },
      },
    ],
  };

  return (
    <div onClick={onClick}> {/* Wrap the chart in a div to handle onClick */}
      <Plot data={data} layout={layout} />
    </div>
  );

};

export default ProgressBarChart;
