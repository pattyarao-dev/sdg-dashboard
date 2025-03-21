"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { Layout, ScatterData } from "plotly.js";
import axios from "axios";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface LineChartProps {
  goalIndicatorId: number;
  startYear: number;
  endYear: number;
  onClick?: (event: any) => void; // Handles clicking on a year
}

const LineChart: React.FC<LineChartProps> = ({ goalIndicatorId, startYear, endYear, onClick }) => {
  const [chartData, setChartData] = useState<ScatterData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/etl/indicators/${goalIndicatorId}/trend`, {
          params: { start_year: startYear, end_year: endYear },
        });

        const trendData = response.data.trend || [];

        if (trendData.length === 0) {
          setChartData([]);
        } else {
          setChartData([
            {
              x: trendData.map((d: any) => d.year),
              y: trendData.map((d: any) => d.value),
              type: "scatter",
              mode: "lines+markers",
              name: "Indicator Trend",
              hovertemplate: `<b>Year:</b> %{x}<br><b>Progress:</b> %{y}%<extra></extra>`,
              marker: { size: 8 },
            },
          ]);
        }
      } catch (err) {
        setError("Failed to fetch data");
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [goalIndicatorId, startYear, endYear]);

  if (loading) return <p>Loading trend data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (chartData.length === 0) return <p>No trend data available.</p>;

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
      data={chartData}
      layout={layout}
      config={{ displayModeBar: false, responsive: true }}
      onClick={onClick}
    />
  );
};

export default LineChart;
