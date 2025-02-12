"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Data } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PaceBarChartProps {
  sdgData: {
    title: string;
    global_target_value: number;
    global_current_value: { year: number; current: number; target: number }[];
    indicators: {
      name: string;
      current: number[];
      target: number[];
      sub_indicators?: { name: string; current: number[]; target: number[] }[];
    }[];
  }[];
}

const PaceBarChart: React.FC<PaceBarChartProps> = ({ sdgData }) => {
    if (!sdgData || sdgData.length === 0) {
      return <div>Loading...</div>;
    }
  
    const sdgNames = sdgData.map((sdg) => sdg.title);
  
    // Extract the latest progress values for each SDG
    const progressValues = sdgData.map((sdg) => {
      const latestData = sdg.global_current_value && sdg.global_current_value.length > 0
        ? sdg.global_current_value[sdg.global_current_value.length - 1]
        : null;
      return latestData ? latestData.current : 0;
    });
  
    const hasSufficientData = sdgData.map((sdg) => {
      const sufficientIndicators = sdg.indicators.filter((indicator) => {
        const hasTwoDataPoints = indicator.current.length >= 2;
        const has2030Target = indicator.target && indicator.target.includes(2030);
        return hasTwoDataPoints && has2030Target;
      });
      return sufficientIndicators.length / sdg.indicators.length >= 0.5;
    });
  
    const barColors = sdgData.map((sdg) => {
      const latestData = sdg.global_current_value && sdg.global_current_value.length > 0
        ? sdg.global_current_value[sdg.global_current_value.length - 1]
        : null;
      const target = latestData?.target || 0;
      const current = latestData?.current || 0;
  
      if (current >= target) {
        return "#4CAF50";
      }
  
      if (current < target) {
        return "#F44336";
      }
  
      return "#FF5722";
    });
  
    const cappedValues = sdgData.map((sdg) => {
      const latestData = sdg.global_current_value && sdg.global_current_value.length > 0
        ? sdg.global_current_value[sdg.global_current_value.length - 1]
        : null;
      const target = latestData?.target || 0;
      const current = latestData?.current || 0;
      const progress = target !== 0 ? ((current - target) / target) * 100 : 0;
      return Math.max(Math.min(progress, 100), -100);
    });
  
    const barColorsWithInsufficientData = barColors.map((color, index) => {
      if (!hasSufficientData[index]) {
        if (barColors[index] === "#4CAF50") {
          return "#81C784"; 
        }
        if (barColors[index] === "#F44336") {
          return "#FFCDD2";
        }
      }
      return color;
    });
  
    const barData: Data = {
      x: sdgNames,
      y: cappedValues,
      type: "bar",
      marker: {
        color: barColorsWithInsufficientData,
      },
      text: cappedValues.map((value) => `${value.toFixed(2)}%`),
      textposition: "inside",
    };
  
    return (
      <Plot
        data={[barData]}
        layout={{
          title: "SDG Progress (2020-2030)",
          xaxis: { title: "Sustainable Development Goals" },
          yaxis: {
            title: "Progress (%)",
            range: [-100, 100],
          },
          showlegend: false,
        }}
        config={{ responsive: true }}
      />
    );
  };
  
export default PaceBarChart;
