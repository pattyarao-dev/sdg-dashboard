"use client";

import React, { useState } from "react";
// import { useRouter } from "next/router";
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
      { year: 2026, current: 57, target: 60 },
      { year: 2027, current: 65, target: 60 },
      { year: 2028, current: 70, target: 60 },
      { year: 2029, current: 50, target: 60 },
      { year: 2030, current: 70, target: 100 },
    ],
    indicators: [
      {
        name: "Poverty Rate",
        current: [30, 40, 45, 50, 55, 60, 65, 70, 75, 85, 100],
        target: [50, 55, 60, 65, 70, 85, 85, 85, 85, 85, 85],
        sub_indicators: [
          {
            name: "Urban Poverty",
            current: [10, 15, 18, 22, 25, 28, 32, 35, 38, 42, 50],
            target: [15, 18, 22, 25, 28, 30, 35, 40, 45, 50, 55],
          },
          {
            name: "Rural Poverty",
            current: [20, 25, 27, 28, 30, 32, 33, 35, 37, 43, 50],
            target: [35, 40, 45, 50, 55, 60, 60, 60, 60, 60, 60],
          },
        ],
      },
      {
        name: "Employment Rate",
        current: [60, 62, 65, 68, 70, 75, 78, 80, 85, 90, 100],
        target: [60, 62, 65, 68, 70, 80, 80, 80, 80, 80, 80],
        sub_indicators: [
          {
            name: "Male Employment",
            current: [35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60],
            target: [40, 42, 45, 47, 50, 55, 60, 65, 70, 75, 80],
          },
          {
            name: "Female Employment",
            current: [25, 24, 25, 26, 28, 30, 33, 35, 38, 40, 45],
            target: [20, 20, 22, 25, 28, 30, 35, 40, 45, 50, 55],
          },
        ],
      },
      {
        name: "Social Protection Coverage",
        current: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
        target: [60, 65, 70, 75, 75, 75, 75, 75, 75, 75, 75],
        sub_indicators: [
          {
            name: "Public Assistance Programs",
            current: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
            target: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
          },
          {
            name: "Healthcare Access",
            current: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
            target: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
          },
        ],
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
      { year: 2024, current: 40, target: 60 },
      { year: 2025, current: 52, target: 60 },
      { year: 2026, current: 65, target: 60 },
      { year: 2027, current: 45, target: 60 },
      { year: 2028, current: 75, target: 60 },
      { year: 2029, current: 35, target: 60 },
      { year: 2030, current: 75, target: 100 },
    ],
    indicators: [
      {
        name: "Malnutrition Rate",
        current: [40, 42, 45, 48, 50, 53, 55, 60, 65, 70, 100],
        target: [50, 55, 60, 65, 70, 75, 80, 80, 80, 80, 80],
        sub_indicators: [
          {
            name: "Child Malnutrition",
            current: [15, 18, 20, 22, 23, 25, 27, 30, 33, 40, 50],
            target: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
          },
          {
            name: "Adult Malnutrition",
            current: [25, 24, 25, 26, 27, 28, 28, 30, 32, 30, 50],
            target: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
          },
        ],
      },
      {
        name: "Food Security Index",
        current: [55, 57, 60, 63, 65, 68, 70, 75, 80, 85, 100],
        target: [60, 65, 70, 75, 80, 85, 85, 85, 85, 85, 85],
        sub_indicators: [
          {
            name: "Urban Food Security",
            current: [20, 22, 23, 24, 25, 28, 30, 33, 35, 40, 45],
            target: [25, 28, 30, 32, 35, 38, 40, 42, 45, 50, 55],
          },
          {
            name: "Rural Food Security",
            current: [35, 35, 37, 39, 40, 42, 45, 48, 50, 55, 60],
            target: [35, 37, 40, 42, 45, 50, 55, 60, 65, 70, 75],
          },
        ],
      },
      {
        name: "Agricultural Productivity",
        current: [65, 67, 70, 73, 75, 78, 80, 85, 90, 95, 100],
        target: [70, 75, 80, 80, 80, 80, 80, 80, 80, 80, 80],
        sub_indicators: [
          {
            name: "Cereal Production",
            current: [25, 28, 30, 32, 34, 36, 38, 40, 42, 45, 50],
            target: [30, 32, 35, 37, 40, 42, 45, 47, 50, 53, 55],
          },
          {
            name: "Livestock Production",
            current: [40, 42, 44, 46, 48, 50, 52, 55, 58, 60, 65],
            target: [40, 42, 45, 47, 50, 52, 55, 58, 60, 63, 65],
          },
        ],
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
      { year: 2025, current: 65, target: 80 },
      { year: 2026, current: 75, target: 80 },
      { year: 2027, current: 78, target: 80 },
      { year: 2028, current: 82, target: 80 },
      { year: 2029, current: 60, target: 80 },
      { year: 2030, current: 82, target: 100 },
    ],
    indicators: [
      {
        name: "Life Expectancy",
        current: [70, 71, 72, 73, 74, 75, 76, 78, 80, 85, 100],
        target: [75, 76, 77, 78, 79, 80, 81, 81, 81, 81, 81],
        sub_indicators: [
          {
            name: "Male Life Expectancy",
            current: [65, 67, 68, 70, 71, 72, 73, 75, 77, 80, 85],
            target: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
          },
          {
            name: "Female Life Expectancy",
            current: [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85],
            target: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
          },
        ],
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
      { year: 2025, current: 78, target: 90 },
      { year: 2026, current: 87, target: 90 },
      { year: 2027, current: 88, target: 90 },
      { year: 2028, current: 90, target: 90 },
      { year: 2029, current: 30, target: 90 },
      { year: 2030, current: 93, target: 100 },
    ],
    indicators: [
      {
        name: "Literacy Rate",
        current: [80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100],
        target: [85, 87, 89, 91, 93, 95, 97, 99, 100, 100, 100],
        sub_indicators: [
          {
            name: "Urban Literacy",
            current: [90, 92, 94, 96, 98, 100, 100, 100, 100, 100, 100],
            target: [90, 92, 94, 96, 98, 100, 100, 100, 100, 100, 100],
          },
          {
            name: "Rural Literacy",
            current: [60, 62, 65, 68, 70, 73, 75, 78, 80, 85, 90],
            target: [65, 68, 70, 72, 75, 78, 80, 85, 90, 95, 100],
          },
        ],
      },
    ],
  },
];

const Dashboard: React.FC = () => {

  // const router = useRouter();

  // const handleGaugeClick = (sdgTitle: string) => {
  //   // Redirect to the project dashboard based on the SDG title
  //   router.push(`/projectdashboard/${sdgTitle}`);
  // };

  const [selectedYear, setSelectedYear] = useState(2020);
  const [selectedSDG, setSelectedSDG] = useState<string>("");

  const selectedSDGData = sdgData.find((sdg) => sdg.id === parseInt(selectedSDG)) || null;
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

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
                  progress={(indicator.current[selectedYear - 2020] / indicator.target[selectedYear - 2020]) * 100}
                  target={indicator.target[selectedYear - 2020]}
                  onClick={() => setSelectedIndicator(indicator.name)} // Pass selected indicator name
                />                
                ))}
              </>
            )}
          </div>
          {/* Display the StackedBarChart if an SDG and indicator are selected */}
          {selectedSDG && selectedIndicator && (
              <StackedBarChart selectedIndicator={selectedIndicator} sdgData={sdgData} />
            )}
        </div>

        {/* LineChart & ProgressBars */}
        <div>
          {/* LineChart */}
          <h2>SDG {selectedSDG} Achievement Level by Year</h2>
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
            // onClick={() => handleGaugeClick(sdg.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
