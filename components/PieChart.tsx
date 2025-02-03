"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const PieChart: React.FC = () => {
  const data: Data[] = [
    {
      labels: ["Education", "Health", "Environment", "Economy"],
      values: [30, 25, 20, 25],
      type: "pie",
      marker: { colors: ["#ff6347", "#1e90ff", "#32cd32", "#ff4500"] },
    },
  ];

  const layout: Partial<Layout> = {
    title: "SDG Contribution by Sector",
    showlegend: true,
  };

  return <Plot data={data} layout={layout} />;
};

export default PieChart;
