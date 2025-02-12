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
      sub_indicators: { name: string; current: number[]; target: number[] }[];
    }[];
  }[];
  selectedYear: number; 
};

const DonutChart: React.FC<DonutChartProps> = ({ selectedIndicator, sdgData, selectedYear }) => {
  const selectedSDG = sdgData.find((sdg) =>
    sdg.indicators.some((indicator) => indicator.name === selectedIndicator)
  );

  if (!selectedSDG) return <p>No data available for this SDG.</p>;

  const selectedIndicatorData = selectedSDG.indicators.find(
    (indicator) => indicator.name === selectedIndicator
  );

  if (!selectedIndicatorData) return <p>No indicator data found for this indicator.</p>;

  const subIndicators: SubIndicator[] = selectedIndicatorData.sub_indicators || [];
  const yearIndex = selectedYear - 2020; // Adjust based on first year of data

  const dataForChart = subIndicators.map((subIndicator: SubIndicator) => {
    const currentValue = subIndicator.current[yearIndex] ?? subIndicator.current[subIndicator.current.length - 1];
    const targetValue = (subIndicator.target[yearIndex] ?? subIndicator.target[subIndicator.target.length - 1]) || 1;

    return {
      label: subIndicator.name,
      value: Math.max((currentValue / targetValue) * 100, 0),
    };
  });

  const overallProgress = selectedIndicatorData.current[yearIndex] ?? selectedIndicatorData.current[selectedIndicatorData.current.length - 1];
  const overallTarget = (selectedIndicatorData.target[yearIndex] ?? selectedIndicatorData.target[selectedIndicatorData.target.length - 1]) || 1;
  const averageOverallProgress = (overallProgress / overallTarget) * 100;

  return (
    <Plot
      data={[
        {
          values: dataForChart.map((ind) => ind.value),
          labels: dataForChart.map((ind) => ind.label),
          type: "pie",
          hole: 0.5,
          textinfo: "percent",
          hoverinfo: "label+percent",
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
          x: 0.5,
          xanchor: "center",
        },
        showlegend: true,
        margin: { t: 40, b: 20, l: 20, r: 20 },
        annotations: [
          {
            text: `Indicator Progress:<br>${averageOverallProgress.toFixed(1)}%`,
            showarrow: false,
            font: { size: 16 },
            x: 0.5,
            y: 0.5,
            xanchor: "center",
            yanchor: "middle",
          },
        ],
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default DonutChart;
