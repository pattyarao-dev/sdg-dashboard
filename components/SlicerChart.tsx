"use client";

import React from "react";

interface SlicerChartProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedSDG: string;
  setSelectedSDG: (sdg: string) => void;
}

const sdgs = [
  { id: "1", title: "No Poverty" },
  { id: "2", title: "Zero Hunger" },
  { id: "3", title: "Good Health & Well-being" },
  { id: "4", title: "Quality Education" },
  { id: "5", title: "Gender Equality" },
  { id: "6", title: "Clean Water" },
  { id: "7", title: "Affordable Energy" },
  { id: "8", title: "Decent Work" },
  { id: "9", title: "Industry & Innovation" },
  { id: "10", title: "Reduced Inequalities" },
  { id: "11", title: "Sustainable Cities" },
  { id: "12", title: "Responsible Consumption" },
  { id: "13", title: "Climate Action" },
  { id: "14", title: "Life Below Water" },
  { id: "15", title: "Life on Land" },
  { id: "16", title: "Peace & Justice" },
  { id: "17", title: "Partnerships" },
];

const SlicerChart: React.FC<SlicerChartProps> = ({ selectedYear, setSelectedYear, selectedSDG, setSelectedSDG }) => {
  return (
    <div className="p-4 space-y-4">
      {/* SDG Dropdown */}
      <div>
        <label className="block mb-2 text-lg font-semibold">Select SDG:</label>
        <select className="p-2 border rounded-md w-full" value={selectedSDG} onChange={(e) => setSelectedSDG(e.target.value)}>
          <option value="">Select an SDG</option>
          {sdgs.map((sdg) => (
            <option key={sdg.id} value={sdg.id}>
              {sdg.title}
            </option>
          ))}
        </select>
      </div>

      {/* Year Slider */}
      <div>
        <label className="block mb-2 text-lg font-semibold">Select Year: {selectedYear}</label>
        <input type="range" min={2020} max={2030} step={1} value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full" />
      </div>
    </div>
  );
};

export default SlicerChart;
