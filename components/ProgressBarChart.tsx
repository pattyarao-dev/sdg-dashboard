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

interface ProgressBarListProps {
  items: ProgressBarChartProps[];
}

// Single Progress Bar Component
const ProgressBarChart: React.FC<ProgressBarChartProps> = ({ label, progress, target, onClick }) => {
  const data: Data[] = [
    {
      x: [progress], // Progress value
      y: [""], // Empty y value since we're showing label above
      type: "bar",
      orientation: "h",
      marker: { color: "#1e90ff" }, // Blue for progress
      width: 0.6, // Control bar height
    },
    {
      x: [100 - progress], // Empty space to 100%
      y: [""], // Empty y value
      type: "bar",
      orientation: "h",
      marker: { color: "#d3d3d3" }, // Light gray for remaining space
      width: 0.6, // Control bar height
    },
  ];

  const layout: Partial<Layout> = {
    height: 60, // Reduced height for more compact display
    margin: {
      l: 10, // Reduced left margin
      r: 10, // Reduced right margin
      t: 25, // Still need some space for label
      b: 10, // Reduced bottom margin
    },
    barmode: "stack", // Stack progress and empty space
    showlegend: false, // Hide legend for cleaner look
    xaxis: {
      range: [0, 100],
      showgrid: false,
      fixedrange: true, // Prevent zooming on x-axis
    },
    yaxis: {
      showticklabels: false, // Hide y-axis labels
      fixedrange: true, // Prevent zooming on y-axis
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
          width: 2, // Slightly thinner line
          dash: "solid",
        },
      },
    ],
    annotations: [
      {
        x: 0, // Position at the start of the bar
        y: 0, // Position at the center of the bar
        xanchor: "left",
        yanchor: "top",
        text: label,
        showarrow: false,
        font: {
          family: "Arial, sans-serif",
          size: 11, // Slightly smaller font
        },
      }
    ]
  };

  return (
    <div 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Plot
        data={data}
        layout={layout}
        config={{ 
          displayModeBar: false, // Hide the plotly toolbar
          responsive: true
        }}
      />
    </div>
  );
};

// Container Component for the list of progress bars
const ProgressBarList: React.FC<ProgressBarListProps> = ({ items }) => {
  const maxVisibleItems = 5;
  const needsScrolling = items.length > maxVisibleItems;
    
  return (
    <div 
      className="overflow-y-auto" 
      style={{ 
        maxHeight: needsScrolling ? `${maxVisibleItems * 60}px` : 'auto'
      }}
    >
      {items.map((item, index) => (
        <ProgressBarChart
          key={index}
          label={item.label}
          progress={item.progress}
          target={item.target}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
};

export { ProgressBarChart, ProgressBarList };
export default ProgressBarList;