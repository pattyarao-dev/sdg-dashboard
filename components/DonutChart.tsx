"use client";

import dynamic from "next/dynamic";
import * as React from "react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type SubIndicator = {
  name: string;
  current: number[];
  target: number[];
};

type DonutChartProps = {
  selectedIndicator: string;
  sdgData: {
    goal_id: number;
    title: string;
    indicators: {
      name: string;
      current: number[];
      target: number[];
      subIndicators: { name: string; current: number[]; target: number[] }[];
    }[];
  }[];
};

const DonutChart: React.FC<DonutChartProps> = ({ selectedIndicator, sdgData }) => {
  // Find the SDG by matching the indicator name
  const selectedSDG = sdgData.find((sdg) =>
    sdg.indicators.some((indicator) => indicator.name === selectedIndicator)
  );

  if (!selectedSDG) return <p>No data available for this SDG.</p>;

  // Get the selected indicator data for the SDG
  const selectedIndicatorData = selectedSDG.indicators.find(
    (indicator) => indicator.name === selectedIndicator
  );

  if (!selectedIndicatorData) return <p>No indicator data found for this indicator.</p>;

  // Prepare the data for the donut chart (sub-indicators within the selected indicator)
  const subIndicators: SubIndicator[] = selectedIndicatorData.subIndicators || [];

  const dataForChart = subIndicators.map((subIndicator: SubIndicator) => {
    const totalProgress = subIndicator.current.reduce((sum, currentVal, index) => {
      const targetValue = subIndicator.target[index] || 1; // Avoid division by zero
      return sum + (currentVal / targetValue) * 100;
    }, 0);

    const averageProgress = totalProgress / subIndicator.current.length || 0;

    return {
      label: subIndicator.name,
      value: Math.max(averageProgress, 0), // Ensure non-negative values
    };
  });

  return (
    <Plot
      data={[
        {
          values: dataForChart.map((ind) => ind.value),
          labels: dataForChart.map((ind) => ind.label),
          type: "pie",
          hole: 0.4, // Donut effect
          textinfo: "label+percent",
          hoverinfo: "label+percent+name", // Corrected hoverinfo value
          marker: {
            colors: [
              "#FF5733", "#33FF57", "#3377FF", "#FFC300", "#C70039",
              "#900C3F", "#DAF7A6", "#581845", "#00a8cc", "#ff6f61"
            ],
          },
        },
      ]}
      layout={{
        title: {
          text: `Indicator Breakdown for ${selectedSDG.title} - ${selectedIndicator}`,
          font: { size: 18 },
          x: 0.5, // Center title
          xanchor: "center",
        },
        showlegend: true,
        margin: { t: 40, b: 20, l: 20, r: 20 },
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default DonutChart;
