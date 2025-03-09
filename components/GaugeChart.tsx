"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface GaugeChartProps {
  title: string;
  value: number;
  sdgNumber?: number; // Optional SDG number
  color?: string;    // Optional custom color
  onClick?: (sdgNumber: number) => void; // Optional click handler for filtering
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  title, 
  value, 
  sdgNumber, 
  color,
  onClick 
}) => {
  const handleOnClick = () => {
    // If onClick is provided and sdgNumber exists, call the handler
    if (onClick && sdgNumber !== undefined) {
      onClick(sdgNumber);
    }
  };

  const getGaugeColor = (percentage: number) => {
    if (percentage < 50) return "#E5243B"; // Red (0-49%)
    if (percentage < 80) return "#FF9800"; // Orange (50-79%)
    return "#4CAF50"; // Green (80-100%)
  };

  // Use provided color or determine by value
  const gaugeColor = color || getGaugeColor(value);

  const data: Data[] = [
    {
      type: "indicator",
      mode: "gauge+number",
      value,
      number: { suffix: "%" },
      title: { text: `${title}`, font: { size: 12 } },
      gauge: {
        axis: { range: [0, 100] },
        bar: { color: gaugeColor },
      },
    },
  ];

  const layout: Partial<Layout> = {
    width: 200,
    height: 150,
    margin: { t: 40, b: 10, l: 10, r: 10 },
  };

  return (
    <div 
      onClick={handleOnClick} 
      style={{ cursor: onClick ? "pointer" : "default" }}
      className="transition-all duration-200 hover:opacity-90"
    >
      <Plot data={data} layout={layout} config={{ displayModeBar: false }} />
    </div>
  );
};

export default GaugeChart;