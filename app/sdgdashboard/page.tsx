"use client";

import React, { useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import SlicerChart from "@/components/SlicerChart";

const datasets = {
  dataset1: {
    years: [2020, 2021, 2022, 2023],
    values: [10, 15, 13, 17],
    name: "Dataset 1",
    color: "blue",
  },
  dataset2: {
    years: [2020, 2021, 2022, 2023],
    values: [16, 5, 11, 9],
    name: "Dataset 2",
    color: "red",
  },
  dataset3: {
    years: [2020, 2021, 2022, 2023],
    values: [7, 8, 6, 10],
    name: "Dataset 3",
    color: "green",
  },
};

const Dashboard: React.FC = () => {
  // Centralized state for dataset selection and year filtering
  const [selectedDataset, setSelectedDataset] = useState<keyof typeof datasets>("dataset1");
  const [selectedYear, setSelectedYear] = useState(2020);

  // Find index of selected year
  const yearIndex = datasets[selectedDataset].years.indexOf(selectedYear);

  // Ensure valid data
  const filteredData =
    yearIndex !== -1
      ? {
          x: [selectedYear], // Only selected year
          y: [datasets[selectedDataset].values[yearIndex]], // Corresponding Y value
          type: "scatter",
          mode: "markers",
          marker: { color: datasets[selectedDataset].color, size: 10 },
          name: `${datasets[selectedDataset].name} (${selectedYear})`,
        }
      : null;

  // Randomized gauge data
  const gaugeData = Array.from({ length: 9 }, (_, index) => ({
    title: `Gauge ${index + 1}`,
    value: Math.floor(Math.random() * 100),
    color: `hsl(${(index * 40) % 360}, 100%, 50%)`,
  }));

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px" }}>
      <h1>LGU SDG Dashboard</h1>

      {/* Slicer Chart (Controls the filters) */}
      <SlicerChart
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        {/* Line Chart (Only render if data exists) */}
        {filteredData && <LineChart data={[filteredData]} title={`Filtered Data for ${selectedYear}`} />}

      </div>

      {/* Gauges Section */}
        <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, minmax(120px, 1fr))", // First row with 9 columns
            gap: "10px",
            marginTop: "20px",
            padding: "20px",
        }}
        >
        {/* Render the first 9 gauges */}
        {gaugeData.slice(0, 9).map((gauge, index) => (
            <GaugeChart key={index} title={gauge.title} value={gauge.value} color={gauge.color} />
        ))}
        </div>

        <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, minmax(120px, 1fr))", // Second row with 8 columns
            gap: "10px",
            marginTop: "20px",
            padding: "20px",
        }}
        >
        {/* Render the remaining 8 gauges */}
        {gaugeData.slice(9).map((gauge, index) => (
            <GaugeChart key={index + 9} title={gauge.title} value={gauge.value} color={gauge.color} />
        ))}
        </div>
    </div>
  );
};

export default Dashboard;
