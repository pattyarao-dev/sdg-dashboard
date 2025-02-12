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
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
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
  
    const barangayData = dummySDGData.find((sdg) =>
    sdg.location_data?.some((loc: any) => loc.barangay === selectedBarangay)
  );

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
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "10px",
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
          <Scorecard sdgData={sdgData} />
        </div>

        {/* Scrollable ProgressBars */}
        <div>
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
            <DonutChart selectedIndicator={selectedIndicator} sdgData={sdgData} selectedYear={selectedYear} />
          )}
        </div>

        {/* LineChart Section */}
        <div>
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
              target={selectedSDGData.global_target_value}
              onClick={(event) => {
                if (event?.points?.length) {
                  handleYearClick(event.points[0].x);
                }
              }}
            />
          )}

          {selectedIndicator && selectedSDGData && (() => {
            const selectedIndicatorData = selectedSDGData.indicators.find(
              (indicator) => indicator.name === selectedIndicator
            );

            if (!selectedIndicatorData) return null; // Ensure it exists

            return (
              <>
                <h2>{selectedIndicatorData.name} Achievement Level by Year</h2>  
                <LineChart
                  data={[
                    {
                      x: selectedIndicatorData.current.map((_, idx) => 2020 + idx),
                      y: selectedIndicatorData.current,
                      type: "scatter",
                      mode: "lines+markers",
                      marker: { color: "green" },
                      line: { color: "green" },
                      name: selectedIndicatorData.name, // Ensure correct name display
                    },
                  ]}
                  target={selectedSDGData.global_target_value}
                  onClick={(event) => {
                    if (event?.points?.length) {
                      handleYearClick(event.points[0].x);
                    }
                  }}
                />
              </>
            );
          })()}
        </div>

        <div> 
          {/* Choropleth Map & Drilldown Panel */}
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            {/* Choropleth Map */}
            <div style={{ flex: 2 }}>
              <h2>Choropleth Map of Pasig City</h2>
              <ChoroplethMap onBarangaySelect={setSelectedBarangay} />
            </div>

            {/* Drilldown Panel */}
            {selectedBarangay && barangayData && (
              <div style={{ flex: 1, border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
                <h2>{selectedBarangay} - SDG Performance</h2>
                <LineChart
                  data={[
                    {
                      x: barangayData.location_data.map((data: any) => data.year),
                      y: barangayData.location_data.map((data: any) => data.sdg1_poverty_rate),
                      type: "scatter",
                      mode: "lines+markers",
                      marker: { color: "blue" },
                      line: { color: "blue" },
                      name: "Poverty Rate",
                    },
                  ]}
                />
                <DonutChart selectedIndicator="sdg1_poverty_rate" sdgData={[barangayData]} selectedYear={2023} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SDG Progress Overview */}
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
        {sdgData.map((sdg) => {
          const currentValue =
            sdg.global_current_value.find((item: { year: number; current: number }) => item.year === selectedYear)
              ?.current || 0;
          const progressPercentage = (currentValue / sdg.global_target_value) * 100;

          return (
            <GaugeChart
              key={sdg.goal_id}
              title={sdg.title}
              value={isNaN(progressPercentage) ? 0 : progressPercentage}
              sdgNumber={sdg.goal_id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;