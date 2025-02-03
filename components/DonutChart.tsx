"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const DonutChart: React.FC<{ selectedSDGData: any }> = ({ selectedSDGData }) => {
  // Prepare data for donut chart
  const indicators = selectedSDGData.indicators.map(indicator => ({
    label: indicator.name,
    value: indicator.current.reduce((sum, currentVal, index) => sum + (currentVal / indicator.target[index]) * 100, 0) / indicator.current.length // Calculate average progress
  }));

  return (
    <Plot
      data={[
        {
          values: indicators.map(indicator => indicator.value),
          labels: indicators.map(indicator => indicator.label),
          type: 'pie',
          hole: 0.4,
          textinfo: 'percent+label', // Show both percentage and label
        },
      ]}
      layout={{
        title: `Indicator Progress Breakdown for ${selectedSDGData.title}`,
        showlegend: true,
      }}
    />
  );

  return <Plot data={data} layout={layout} />;
};

export default DonutChart;
