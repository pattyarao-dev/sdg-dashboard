"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface TreemapChartProps {
    labels: string[];
    values: number[];
}
const TreemapChart: React.FC<TreemapChartProps> = ({ labels, values }) => {
    const data: Data[] = [{
        type: "treemap" as "treemap",
        labels,
        parents: Array(labels.length).fill(""),
        values,
    }];
    return <Plot data={data} layout={{ title: "SDG Contribution by Sector" }} />;
};

export default TreemapChart;