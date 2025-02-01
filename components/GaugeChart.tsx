"use client";

import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import * as React from "react";
import { Data } from "plotly.js";

interface GaugeChartProps {
    title: string;
    value: number;
    color: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ title, value, color }) => {
  // Define the data for the gauge
  const data: Data[] = [
    {
      type: 'indicator' as 'indicator',
      mode: "gauge+number",
      value: 70, // Initial value of the gauge
      title: { text: "SDG " + title , font: { size: 12 } },
      gauge: {
        axis: { range: [0, 100] }, // Set the range of the gauge
        bar: { color: "#f44336" }, // Color of the gauge bar
      },
    },
  ];

  // Define layout (optional)
  const layout = {
    width: 100, // Set width
    height: 150, // Set height
    margin: { t: 5, b: 5, l: 5, r: 5 }, // Set margins
  };

  return (
    <div>
      <Plot data={data} layout={layout} />
    </div>
  );
};

export default GaugeChart;
