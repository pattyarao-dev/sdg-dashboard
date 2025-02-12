import React from "react";
import Plot from "react-plotly.js";

const SDGProgressChart = ({ sdgData }) => {
  // Check if sdgData exists and is an array
  if (!Array.isArray(sdgData) || sdgData.length === 0) {
    return <div>No SDG data available</div>;
  }

  // Process data for chart
  const sdgNames = sdgData.map((sdg) => sdg.title);

  // Handle cases where global_current_value might be missing or empty
  const progressValues = sdgData.map((sdg) => {
    // Ensure global_current_value is not empty and has at least one entry
    const latestData = sdg.global_current_value && sdg.global_current_value.length > 0
      ? sdg.global_current_value[sdg.global_current_value.length - 1]
      : null;
    return latestData ? latestData.current : 0; // Return 0 if no data found
  });

  // Trend values: Extracting all 'current' values for each SDG (if they exist)
  const trendValues = sdgData.map((sdg) => {
    if (sdg.global_current_value && sdg.global_current_value.length > 0) {
      return sdg.global_current_value.map((entry) => entry.current);
    }
    return []; // Return empty array if no data is available
  });

  // Determine if SDG has sufficient data (solid vs. patterned bars)
  const hasSufficientData = sdgData.map((sdg) => {
    const dataPoints = sdg.global_current_value ? sdg.global_current_value.length : 0;
    const has2030Target = sdg.global_current_value && sdg.global_current_value.some((entry) => entry.year === 2030);
    return dataPoints >= 2 && has2030Target;
  });

  return (
    <Plot
      data={[
        {
          x: sdgNames,
          y: progressValues,
          type: "bar",
          marker: {
            color: progressValues.map((value, index) =>
              value >= (trendValues[index][0] || 0)
                ? "#4CAF50" // Green (progress)
                : value === (trendValues[index][0] || 0)
                ? "#FFC107" // Yellow (stagnation)
                : "#F44336" // Red (regression)
            ),
            pattern: {
              shape: hasSufficientData.map((sufficient) => (sufficient ? "" : "x")),
            },
          },
        },
        {
          x: sdgNames,
          y: progressValues,
          type: "scatter",
          mode: "lines",
          line: { shape: "spline", color: "blue", width: 2 },
          name: "Trendline",
        },
      ]}
      layout={{
        title: "SDG Progress (2020-2030)",
        xaxis: { title: "Sustainable Development Goals" },
        yaxis: { title: "Progress (%)" },
        showlegend: true,
      }}
      config={{ responsive: true }}
    />
  );
};

export default SDGProgressChart;
