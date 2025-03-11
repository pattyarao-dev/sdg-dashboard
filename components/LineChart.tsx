"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Layout, ScatterData } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface LineChartProps {
  data: ScatterData[]; // Expecting ScatterData[] type for the chart data
  onClick: (event: any) => void; // Handles the clicked year
}

const LineChart: React.FC<LineChartProps> = ({ data, onClick }) => {
  if (!data || data.length === 0 || !data[0]?.x) return null;

  // Add hover template to show Year & Value
  const enhancedData = data.map(series => ({
    ...series,
    hovertemplate: `<b>Year:</b> %{x}<br><b>Progress:</b> %{y}%<extra></extra>`,
    marker: { size: 8 }, // Slightly bigger points for better visibility
  }));

  // Layout configuration
  const layout: Partial<Layout> = {
    width: 600,
    height: 600,
    xaxis: {
      title: "Year",
      tickmode: "linear",
      dtick: 1,
      tickformat: "d",
    },
    yaxis: {
      title: "Progress",
      range: [0, 100],
      dtick: 10,
    },
    showlegend: true,
  };

  return (
    <Plot
      data={enhancedData}
      layout={layout}
      config={{ 
        displayModeBar: false, 
        responsive: true 
      }}
      onClick={onClick}
    />
  );
};

export default LineChart;

// "use client";

// import dynamic from "next/dynamic";
// import React from "react";
// import { Layout, ScatterData } from "plotly.js";

// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// interface LineChartProps {
//   data: ScatterData[]; // Expecting ScatterData[] type for the chart data
//   // target: number; // Target value for the SDG
//   onClick: (event: any) => void; // Add onClick prop to handle the clicked year
// }

// const LineChart: React.FC<LineChartProps> = ({ data, onClick }) => {
//   if (!data || data.length === 0 || !data[0]?.x) return null;

//   // Create the target line data
//   // const targetLine: ScatterData = {
//   //   x: data[0]?.x, // Use x-values (years) from the main progress data
//   //   y: new Array(data[0]?.x.length).fill(target), // Repeat the target value for all years
//   //   type: "scatter",
//   //   mode: "lines",
//   //   name: "Target",
//   //   line: { dash: "solid", color: "black", width: 2 }, // Dashed black target line
//   // };

//   // Layout configuration
//   const layout: Partial<Layout> = {
//     width: 600,
//     height: 600,
//     xaxis: {
//       title: "Year",
//       tickmode: "linear",
//       dtick: 1,
//       tickformat: "d",
//     },
//     yaxis: {
//       title: "Progress",
//       range: [0, 100],
//       dtick: 10,
//     },
//     showlegend: true,
//   };

//   return (
//     <Plot
//       data={[...data]}
//       layout={layout}
//       config={{ 
//         displayModeBar: false, 
//         responsive: true
//       }}
//       onClick={onClick}
//     />
//   );
// };

// export default LineChart;
