import React from "react";
import dynamic from "next/dynamic";
import { Data, Layout } from "plotly.js";

// Dynamically import Plot for client-side rendering
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface StackedBarChartProps {
  selectedIndicator: string;
  sdgData: {
    id: number;
    title: string;
    global_target_value: number;
    global_current_value: { year: number; current: number; target: number }[];
    indicators: {
      name: string;
      current: number[];
      target: number[];
      sub_indicators: { name: string; current: number[]; target: number[] }[];
    }[];
  }[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ selectedIndicator, sdgData }) => {
  // Find the SDG by matching the indicator name
  const selectedSDG = sdgData.find((sdg) => sdg.indicators.some((indicator) => indicator.name === selectedIndicator));

  if (!selectedSDG) return <div>No data available for this SDG.</div>;

  // Get the selected indicator data for the SDG
  const selectedIndicatorData = selectedSDG.indicators.find((indicator) => indicator.name === selectedIndicator);

  if (!selectedIndicatorData) return <div>No indicator data found for this indicator.</div>;

  // Prepare the data for the stacked bar chart
  const data: Data[] = selectedIndicatorData.sub_indicators.map((subIndicator, index) => {
    // Calculate the total current value for the indicator (sum of sub-indicator current values)
    const totalCurrentValue = selectedIndicatorData.sub_indicators.reduce(
      (acc, sub) => acc + sub.current[selectedSDG.global_current_value[0].year - 2020], // Accessing current year data
      0
    );

    // Return chart data for the sub-indicator
    return {
      x: selectedSDG.global_current_value.map((item) => item.year), // X-axis (years)
      y: subIndicator.current.map((currentValue, yearIndex) => (currentValue / totalCurrentValue) * 100), // Calculate percentage contribution
      name: subIndicator.name, // Sub-indicator name
      type: "bar", // Chart type is bar
      stackgroup: "one", // Stack bars in the same group
      marker: { color: `hsl(${(index * 50) % 360}, 70%, 50%)` }, // Dynamic color for each sub-indicator
    };
  });

  // Layout configuration for the stacked bar chart
  const layout: Partial<Layout> = {
    title: `${selectedIndicator} - Sub-Indicator Breakdown`,
    barmode: "stack", // Stack the bars
    xaxis: { title: "Year" }, // X-axis label
    yaxis: { title: "Contribution (%)", range: [0, 100] }, // Y-axis label, range from 0 to 100%
    showlegend: true, // Show legend
  };

  // Return the Plot component with the prepared data and layout
  return <Plot data={data} layout={layout} />;
};

export default StackedBarChart;
