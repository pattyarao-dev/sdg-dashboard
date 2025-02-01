"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface LineChartProps {
  data: Data[];
  title: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const layout: Layout = {
    title,
    xaxis: { title: "Year" },
    yaxis: { title: "Value" },
    showlegend: true,
  };

  return (
    <div>
      <Plot data={data} layout={layout} />
    </div>
  );
};

export default LineChart;
