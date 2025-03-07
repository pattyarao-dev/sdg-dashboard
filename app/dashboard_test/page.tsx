"use client";

import React, { useEffect, useState } from "react";
import LineChart from "@/components/LineChart";

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
  const [sdgData, setSdgData] = useState<any[]>([]);
  const [selectedSDG, setSelectedSDG] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/load-indicators"); // Call the Load API
        const data = await res.json();
        console.log("Fetched SDG Data:", data); // Debugging
        setSdgData(data.indicators);
        if (data.indicators.length > 0) {
          setSelectedSDG(data.indicators[0].indicator_id.toString());
        }
      } catch (error) {
        console.error("Error fetching SDG data:", error);
      }
    };

    fetchData();
  }, []);

  const selectedSDGData = sdgData.find((sdg) => sdg.goal_id.toString() === selectedSDG) || null;
  
//     const barangayData = dummySDGData.find((sdg) =>
//     sdg.location_data?.some((loc: any) => loc.barangay === selectedBarangay)
//   );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>

      {/* SDG Dropdown Selector */}
      <select
        value={selectedSDG || ""}
        onChange={(e) => setSelectedSDG(e.target.value)}
        className="border p-2 rounded"
      >
        {sdgData.map((sdg) => (
          <option key={sdg.indicator_id} value={sdg.indicator_id}>
            {sdg.name}
          </option>
        ))}
      </select>

      {/* Display Selected Indicator Data */}
      <div className="mt-4">
        {selectedSDG && (
          <p className="text-lg font-semibold">
            Selected Indicator:{" "}
            {sdgData.find((sdg) => sdg.indicator_id.toString() === selectedSDG)?.name}
          </p>
        )}
      </div>

      {/* Chart Component */}
      <div className="mt-6">
        <LineChart 
            data={sdgData}
            // target={selectedSDGData.global_target_value}
              onClick={(event) => {
                if (event?.points?.length) {
                }
              }} />
      </div>
    </div>
  );
};

export default Dashboard;
