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
    xaxis: { title: "Year" },
    yaxis: { title: "% Goal Achieved" },
    showlegend: true,
  };

  return <Plot data={data} layout={layout} />;
};

export default LineChart;
