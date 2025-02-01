"use client";

import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import * as React from "react";
import { Data } from "plotly.js";

interface BubbleChartProps {
    x: number[];
    y: number[];
    sizes: number[];
    labels: string[];
}
const BubbleChart: React.FC<BubbleChartProps> = ({ x, y, sizes, labels }) => {
    const data: Data[] = [{
        x,
        y,
        text: labels,
        mode: "markers",
        marker: { size: sizes, color: "blue", opacity: 0.6 },
        type: "scatter" as "scatter",
    }];
    const layout: Layout = { title: "Budget vs. Impact", xaxis: { title: "Budget" }, yaxis: { title: "Impact" } };
    return <Plot data={data} layout={layout} />;
};

export default BubbleChart;
