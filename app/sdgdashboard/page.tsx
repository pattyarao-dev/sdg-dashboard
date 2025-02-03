"use client";

import React, { useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import SlicerChart from "@/components/SlicerChart";
import ProgressBarChart from "@/components/ProgressBarChart";
import StackedBarChart from "@/components/StackedBarChart";
import TreemapChart from "@/components/TreemapChart";

// Dummy Data for SDG Progress
const sdgData = [
  { id: 1, title: "No Poverty", global_current_value: 45, global_target_value: 100, indicators: [{ name: "Poverty Rate", current: 30, target: 100 }] },
  { id: 2, title: "Zero Hunger", global_current_value: 60, global_target_value: 100, indicators: [{ name: "Malnutrition", current: 50, target: 100 }] },
  { id: 3, title: "Good Health", global_current_value: 50, global_target_value: 100, indicators: [{ name: "Life Expectancy", current: 75, target: 100 }] },
  { id: 4, title: "Quality Education", global_current_value: 70, global_target_value: 100, indicators: [{ name: "Literacy Rate", current: 80, target: 100 }] },
  { id: 5, title: "Gender Equality", global_current_value: 65, global_target_value: 100, indicators: [{ name: "Women in Leadership", current: 60, target: 100 }] },
  { id: 6, title: "Clean Water", global_current_value: 55, global_target_value: 100, indicators: [{ name: "Access to Clean Water", current: 85, target: 100 }] },
  { id: 7, title: "Affordable Energy", global_current_value: 75, global_target_value: 100, indicators: [{ name: "Renewable Energy Usage", current: 65, target: 100 }] },
  { id: 8, title: "Decent Work", global_current_value: 50, global_target_value: 100, indicators: [{ name: "Employment Rate", current: 70, target: 100 }] },
  { id: 9, title: "Industry & Innovation", global_current_value: 60, global_target_value: 100, indicators: [{ name: "Tech Adoption", current: 55, target: 100 }] },
  { id: 10, title: "Reduced Inequalities", global_current_value: 40, global_target_value: 100, indicators: [{ name: "Income Equality", current: 45, target: 100 }] },
  { id: 11, title: "Sustainable Cities", global_current_value: 70, global_target_value: 100, indicators: [{ name: "Green Buildings", current: 80, target: 100 }] },
  { id: 12, title: "Responsible Consumption", global_current_value: 55, global_target_value: 100, indicators: [{ name: "Recycling Rate", current: 75, target: 100 }] },
  { id: 13, title: "Climate Action", global_current_value: 65, global_target_value: 100, indicators: [{ name: "Carbon Reduction", current: 50, target: 100 }] },
  { id: 14, title: "Life Below Water", global_current_value: 40, global_target_value: 100, indicators: [{ name: "Marine Conservation", current: 60, target: 100 }] },
  { id: 15, title: "Life on Land", global_current_value: 50, global_target_value: 100, indicators: [{ name: "Forest Cover", current: 70, target: 100 }] },
  { id: 16, title: "Peace & Justice", global_current_value: 75, global_target_value: 100, indicators: [{ name: "Crime Reduction", current: 85, target: 100 }] },
  { id: 17, title: "Partnerships", global_current_value: 65, global_target_value: 100, indicators: [{ name: "Global Collaboration", current: 80, target: 100 }] },
];

const Dashboard: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = React.useState<string>("dataset1");
  const [selectedYear, setSelectedYear] = useState(2023);
  const [selectedSDG, setSelectedSDG] = React.useState<string>("");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px" }}>
      <h1>LGU SDG Dashboard</h1>

      {/* Year and SDG Filters */}
      <SlicerChart
        selectedDataset={selectedDataset}     
        setSelectedDataset={setSelectedDataset}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedSDG={selectedSDG}
        setSelectedSDG={setSelectedSDG}
      />

      {/* SDG Progress Gauges (All 17 SDGs) */}
      <h2>SDG Progress Overview</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, minmax(120px, 1fr))",
          gap: "10px",
          marginTop: "20px",
          padding: "20px",
        }}
      >
        {sdgData.slice(0, 9).map((sdg) => (
          <GaugeChart
            key={sdg.id}
            title={sdg.title}
            value={(sdg.global_current_value / sdg.global_target_value) * 100}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, minmax(120px, 1fr))",
          gap: "10px",
          marginTop: "20px",
          padding: "20px",
        }}
      >
        {sdgData.slice(9).map((sdg) => (
          <GaugeChart
            key={sdg.id}
            title={sdg.title}
            value={(sdg.global_current_value / sdg.global_target_value) * 100}
          />
        ))}
      </div>

      {/* SDG Progress Over Time (Line Chart) */}
      <h2>SDG {selectedSDG} Progress Over Time</h2>
      <LineChart
        data={[
          {
            x: [2020, 2021, 2022, 2023], // Dummy Years
            y: [30, 45, 60, 75], // Dummy progress values
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "blue" },
          },
        ]}
      />

      {/* Indicator Progress Bars */}
      <h2>Indicator Progress for SDG {selectedSDG}</h2>
      {sdgData.find((sdg) => sdg.id === parseInt(selectedSDG))?.indicators.map((indicator, index) => (
      <ProgressBarChart 
        key={index} 
        label={indicator.name} 
        progress={(indicator.current / indicator.target) * 100} 
      />
    ))}

      {/* Placeholder for Stacked Bar Chart & Treemap */}
      {/* <h2>SDG Breakdown by Sector</h2>
      <StackedBarChart data={[]} />
      <TreemapChart data={[]} /> */}
    </div>
  );
};

export default Dashboard;
