"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface LineChartProps {
  data: Data[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const layout: Partial<Layout> = {
      xaxis: {
        title: "Year",
        tickmode: "linear",
        dtick: 1, // Ensures ticks are at whole-number years
        tickformat: "d", // Formats the year values as whole numbers
      },
      yaxis: {
        title: "Progress",
        tickformat: ".0f%", // Keep whole numbers but show "%" (e.g., 10%, 20%, 30%)
        range: [0, 100], // Keep the Y-axis within 0-100
        dtick: 10, // 10% increments
      },
    showlegend: true,
  };

  return <Plot data={data} layout={layout} />;
};

export default LineChart;
