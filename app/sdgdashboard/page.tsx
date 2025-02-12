"use client";

import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import SlicerChart from "@/components/SlicerChart";
import ProgressBarChart from "@/components/ProgressBarChart";
import DonutChart from "@/components/DonutChart";
import StackedBarChart from "@/components/StackedBarChart";
import Scorecard from "@/components/Scorecard";
import ChoroplethMap from "@/components/ChoroplethMap";
import PaceBarChart from "@/components/PaceBarChart";
import dummySDGData from "../dummydata/dummySDGData";
// import { getSdgData } from "@/api/get-sdg-data/route.ts";

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

const Dashboard: React.FC = () => {

  // const router = useRouter();

  // const handleGaugeClick = (sdgTitle: string) => {
  //   // Redirect to the project dashboard based on the SDG title
  //   router.push(`/projectdashboard/${sdgTitle}`);
  // };

  const [selectedYear, setSelectedYear] = useState(2020);
  const [selectedSDG, setSelectedSDG] = useState<string>("");
  const [sdgData, setSdgData] = useState<any[]>([]); // State to store SDG data
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch("/api/get-sdg-data"); // Call the API
  //       const data = await res.json();
  //       console.log("Fetched SDG Data:", data); // Debugging
  //       setSdgData(data);
  //       if (data.length > 0) {
  //         setSelectedSDG(data[0].goal_id.toString());
  //       }
  //     } catch (error) {
  //       console.error("Error fetching SDG data:", error);
  //     }
  //   };
  
  //   fetchData();
  // }, []);

  useEffect(() => {
    // Simulating API call delay
    const fetchDummyData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading time
        setSdgData(dummySDGData); // Use dummy data
        if (dummySDGData.length > 0) {
          setSelectedSDG(dummySDGData[0].goal_id.toString());
        }
      } catch (error) {
        console.error("Error loading dummy data:", error);
      }
    };
  
    fetchDummyData();
  }, []);

  const selectedSDGData = sdgData.find((sdg) => sdg.goal_id.toString() === selectedSDG) || null;

  const handleIndicatorClick = (indicatorName: string) => {
    setSelectedIndicators((prevSelectedIndicators) => {
      if (prevSelectedIndicators.includes(indicatorName)) {
        return prevSelectedIndicators.filter((indicator) => indicator !== indicatorName);
      } else {
        return [...prevSelectedIndicators, indicatorName];
      }
    });
  };  

  const handleYearClick = (year: number) => {
    setSelectedYear(year); 
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px" }}>
      <h1>LGU SDG Dashboard</h1>
      {/* Grid Layout for Filters, LineChart & ProgressBars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
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
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          />

          <div>
            <Scorecard sdgData={sdgData} /> {/* Pass sdgData as a prop to Scorecard */}
          </div>

          {/* Scrollable ProgressBars */}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            {selectedSDGData && (
              <>
                <h2>Indicator Progress for {selectedSDGData.title}</h2>
                {selectedSDGData.indicators.map(
                  (indicator: { name: string; current: number[]; target: number | number[] }, index: number) => {
                    const yearIndex = selectedYear - 2020;
                    const currentProgress = indicator.current[yearIndex] ?? indicator.current[indicator.current.length - 1];
                    const targetValue = Array.isArray(indicator.target)
                      ? indicator.target[yearIndex] ?? indicator.target[0]
                      : indicator.target;

                    return (
                      <ProgressBarChart
                        key={index}
                        label={indicator.name}
                        progress={(currentProgress / targetValue) * 100}
                        target={targetValue}
                        onClick={() => setSelectedIndicator(indicator.name)}
                      />
                    );
                  }
                )}
              </>
            )}
          </div>

          {/* Display the DonutChart when an SDG and indicator are selected */}
          {selectedSDG && selectedIndicator && (
            <DonutChart
              selectedIndicator={selectedIndicator}
              sdgData={sdgData}
              selectedYear={selectedYear} // Pass selected year
            />
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
                  x: selectedSDGData.global_current_value.map((item: { year: number; current: number }) => item.year),
                  y: selectedSDGData.global_current_value.map((item: { year: number; current: number }) => item.current),
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: sdgColors[selectedSDGData.title] || "blue" },
                  line: { color: sdgColors[selectedSDGData.title] || "blue" },
                  name: "Current Progress",
                },
              ]}
              target={selectedSDGData.global_target_value} // Pass the global target value dynamically
              onClick={(event) => {
                if (event && event.points && event.points.length > 0) {
                  const clickedYear = event.points[0].x; // Extract the year clicked
                  handleYearClick(clickedYear); // Update state
                }
              }} 
            />
          )}
          {selectedIndicator && selectedSDGData && (
            <LineChart
              data={[
                {
                  x: selectedSDGData.indicators
                    .find((indicator) => indicator.name === selectedIndicator)
                    ?.current.map((_, idx) => 2020 + idx),
                  y: selectedSDGData.indicators
                    .find((indicator) => indicator.name === selectedIndicator)
                    ?.current,
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "green" }, // You can customize the color
                  line: { color: "green" },
                  name: selectedIndicator,
                },
              ]}
              target={selectedSDGData.global_target_value}
              onClick={(event) => {
                if (event && event.points && event.points.length > 0) {
                  const clickedYear = event.points[0].x;
                  handleYearClick(clickedYear); // Update state for year click
                }
              }}
            />
          )}
        </div>

        <div>
          <h1>Choropleth Map of Pasig City</h1>
          <ChoroplethMap />
        </div>
      </div>

      <h2>SDG Progress Overview</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, minmax(120px, 1fr))",
          gridAutoRows: "120px",
          gap: "10px",
          marginTop: "25px",
          padding: "20px",
        }}
      >
        {sdgData.map((sdg) => (
          <GaugeChart
            key={sdg.goal_id}
            title={sdg.title}
            value={
              (sdg.global_current_value.find(
                (item: { year: number; current: number; target: number }) =>
                  item.year === selectedYear
              )?.current || 0) / sdg.global_target_value * 100
            }
            sdgNumber={sdg.goal_id} // Pass SDG number for dynamic routing
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;