"use client";

import * as React from "react";
import Plot from "react-plotly.js"; // Import the Plot component
import { Data } from "plotly.js"; // Import the Plotly data type

const PlotlyChart: React.FC = () => {
    // Specify the type correctly using TypeScript type assertion
    const data: Data[] = [
        {
            labels: ['A', 'B', 'C', 'D'],
            values: [10, 20, 30, 40],
            type: 'pie' as 'pie', // This tells TypeScript that `type` is exactly 'pie'
            marker: { colors: ['#ff6347', '#1e90ff', '#32cd32', '#ff4500'] },
        },
    ];

    const layout = {
        title: 'Simple Pie Chart',
        showlegend: true, // Show legend
    };
    
    return (
        <div>
            <h1>Plotly Pie Chart</h1>
            <Plot data={data} layout={layout} />
        </div>
    );
};

export default PlotlyChart;
