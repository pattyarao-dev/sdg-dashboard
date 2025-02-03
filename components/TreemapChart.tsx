"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface TreemapChartProps {
  title: string;
  labels: string[];
  values: number[];
}

const TreemapChart: React.FC<TreemapChartProps> = ({ title, labels, values }) => {
  const data: Data[] = [
    {
      type: "treemap",
      labels,
      parents: Array(labels.length).fill(""),
      values,
    },
  ];

  const layout: Partial<Layout> = { title };

  return <Plot data={data} layout={layout} />;
};

export default TreemapChart;
