"use client";

import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
import * as React from "react";
import { Data } from "plotly.js";

interface ProgressBarChartProps {
    indicators: { name: string; value: number }[];
}
const ProgressBarChart: React.FC<ProgressBarChartProps> = ({ indicators }) => {
    const data: Data[] = [
        {
            x: indicators.map((i) => i.value),
            y: indicators.map((i) => i.name),
            type: "bar" as "bar",
            orientation: "h",
        },
    ];
    const layout: Layout = { title: "Indicator Progress", barmode: "stack" };
    return <Plot data={data} layout={layout} />;
};

export default ProgressBarChart;