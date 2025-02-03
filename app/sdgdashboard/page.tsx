"use client";

import React, { useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import SlicerChart from "@/components/SlicerChart";
import ProgressBarChart from "@/components/ProgressBarChart";
import StackedBarChart from "@/components/StackedBarChart";
import TreemapChart from "@/components/TreemapChart";

const sdgColors: { [key: string]: string } = {
  "No Poverty": "#E5243B",
  "Zero Hunger": "#DDA63A",
  "Good Health and Well-being": "#4C9F38",
  "Quality Education": "#C5192D",
  "Gender Equality": "#FF3A21",
  "Clean Water and Sanitation": "#26BDE2",
  "Affordable and Clean Energy": "#FCC30B",
  "Decent Work and Economic Growth": "#A21942",
  "Industry, Innovation and Infrastructure": "#FD6925",
  "Reduced Inequalities": "#DD1367",
  "Sustainable Cities and Communities": "#FD9D24",
  "Responsible Consumption and Production": "#BF8B2E",
  "Climate Action": "#3F7E44",
  "Life Below Water": "#0A97D9",
  "Life on Land": "#56C02B",
  "Peace, Justice and Strong Institutions": "#00689D",
  "Partnerships for the Goals": "#19486A",
};

// Dummy Data for SDG Progress
const sdgData = [
  {
    id: 1,
    title: "No Poverty",
    global_target_value: 60,
    global_current_value: [
      { year: 2020, current: 25, target: 60 },
      { year: 2021, current: 35, target: 60 },
      { year: 2022, current: 45, target: 60 },
      { year: 2023, current: 50, target: 60 },
      { year: 2024, current: 55, target: 60 },
      { year: 2025, current: 58, target: 60 },
      { year: 2026, current: 60, target: 60 },
      { year: 2027, current: 65, target: 60 },
      { year: 2028, current: 70, target: 60 },
      { year: 2029, current: 80, target: 60 },
      { year: 2030, current: 100, target: 100 },
    ],
    indicators: [
      {
        name: "Poverty Rate",
        current: [30, 40, 45, 50, 55, 60, 65, 70, 75, 85, 100],
        target: [50, 55, 60, 65, 70, 85, 85, 85, 85, 85, 85],
      },
      {
        name: "Employment Rate",
        current: [60, 62, 65, 68, 70, 75, 78, 80, 85, 90, 100],
        target: [60, 62, 65, 68, 70, 80, 80, 80, 80, 80, 80],
      },
      {
        name: "Social Protection Coverage",
        current: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
        target: [60, 65, 70, 75, 75, 75, 75, 75, 75, 75, 75],
      },
    ],
  },
  {
    id: 2,
    title: "Zero Hunger",
    global_target_value: 60,
    global_current_value: [
      { year: 2020, current: 40, target: 60 },
      { year: 2021, current: 45, target: 60 },
      { year: 2022, current: 50, target: 60 },
      { year: 2023, current: 55, target: 60 },
      { year: 2024, current: 60, target: 60 },
      { year: 2025, current: 62, target: 60 },
      { year: 2026, current: 65, target: 60 },
      { year: 2027, current: 70, target: 60 },
      { year: 2028, current: 75, target: 60 },
      { year: 2029, current: 85, target: 60 },
      { year: 2030, current: 100, target: 100 },
    ],
    indicators: [
      {
        name: "Malnutrition Rate",
        current: [40, 42, 45, 48, 50, 53, 55, 60, 65, 70, 100],
        target: [50, 55, 60, 65, 70, 75, 80, 80, 80, 80, 80],
      },
      {
        name: "Food Security Index",
        current: [55, 57, 60, 63, 65, 68, 70, 75, 80, 85, 100],
        target: [60, 65, 70, 75, 80, 85, 85, 85, 85, 85, 85],
      },
      {
        name: "Agricultural Productivity",
        current: [65, 67, 70, 73, 75, 78, 80, 85, 90, 95, 100],
        target: [70, 75, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      },
    ],
  },
  {
    id: 3,
    title: "Good Health and Well-being",
    global_target_value: 80,
    global_current_value: [
      { year: 2020, current: 50, target: 80 },
      { year: 2021, current: 55, target: 80 },
      { year: 2022, current: 60, target: 80 },
      { year: 2023, current: 65, target: 80 },
      { year: 2024, current: 70, target: 80 },
      { year: 2025, current: 72, target: 80 },
      { year: 2026, current: 75, target: 80 },
      { year: 2027, current: 78, target: 80 },
      { year: 2028, current: 82, target: 80 },
      { year: 2029, current: 85, target: 80 },
      { year: 2030, current: 100, target: 100 },
    ],
    indicators: [
      {
        name: "Life Expectancy",
        current: [70, 71, 72, 73, 74, 75, 76, 78, 80, 85, 100],
        target: [75, 76, 77, 78, 79, 80, 81, 81, 81, 81, 81],
      },
    ],
  },
  {
    id: 4,
    title: "Quality Education",
    global_target_value: 90,
    global_current_value: [
      { year: 2020, current: 60, target: 90 },
      { year: 2021, current: 65, target: 90 },
      { year: 2022, current: 70, target: 90 },
      { year: 2023, current: 75, target: 90 },
      { year: 2024, current: 80, target: 90 },
      { year: 2025, current: 82, target: 90 },
      { year: 2026, current: 85, target: 90 },
      { year: 2027, current: 88, target: 90 },
      { year: 2028, current: 90, target: 90 },
      { year: 2029, current: 95, target: 90 },
      { year: 2030, current: 100, target: 100 },
    ],
    indicators: [
      {
        name: "Literacy Rate",
        current: [80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100],
        target: [85, 87, 89, 91, 93, 95, 97, 99, 100, 100, 100],
      },
    ],
  },

];

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2020);
  const [selectedSDG, setSelectedSDG] = useState<string>("");

  const selectedSDGData = sdgData.find((sdg) => sdg.id === parseInt(selectedSDG)) || null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px" }}>
      <h1>LGU SDG Dashboard</h1>

      {/* Grid Layout for Filters, LineChart & ProgressBars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Filters (SDG & Year) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <SlicerChart
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedSDG={selectedSDG}
            setSelectedSDG={setSelectedSDG}
          />

          {/* Scrollable ProgressBars */}
          <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
            {selectedSDGData && (
              <>
                <h2>Indicator Progress for {selectedSDGData.title}</h2>
                {selectedSDGData.indicators.map((indicator, index) => (
                  <ProgressBarChart
                    key={index}
                    label={indicator.name}
                    progress={(indicator.current[selectedYear - 2020] / indicator.target[selectedYear - 2020]) * 100} // Assuming the year starts from 2020
                    target={indicator.target[selectedYear - 2020]}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* LineChart & ProgressBars */}
        <div>
          {/* LineChart */}
          <h2>SDG {selectedSDG} Progress Over Time</h2>
          {selectedSDGData && (
            <LineChart
              data={[
                {
                  x: selectedSDGData.global_current_value.map((item) => item.year),
                  y: selectedSDGData.global_current_value.map((item) => item.current),
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: sdgColors[selectedSDGData.title] || "blue" }, // Use SDG color or default to blue
                  line: { color: sdgColors[selectedSDGData.title] || "blue" },
                  name: "Current Progress",
                },
                // {
                //   x: selectedSDGData.global_current_value.map((item) => item.year),
                //   y: selectedSDGData.global_current_value.map((item) => item.target),
                //   type: "scatter",
                //   mode: "lines+markers",
                //   marker: { color: "red" },
                //   name: "Target Progress",
                // },
              ]}
            />
          )}
        </div>
      </div>

      {/* SDG Progress Gauges */}
      <h2>SDG Progress Overview</h2>
      {/* <div
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
              title={sdg.title} value={(sdg.global_current_value.find(item => item.year === selectedYear)?.current || 0) / sdg.global_target_value * 100} />
        ))}
      </div> */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, minmax(120px, 1fr))",
          gap: "10px",
          marginTop: "25px",
          padding: "20px",
        }}
      >
        {sdgData.slice(0, 9).map((sdg) => (
          <GaugeChart
            key={sdg.id}
            title={sdg.title}
            value={(sdg.global_current_value.find(item => item.year === selectedYear)?.current || 0) / sdg.global_target_value * 100}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
