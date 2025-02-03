"use client";

import React from "react";

interface SlicerChartProps {
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedSDG: string;
  setSelectedSDG: (sdg: string) => void;
}

const SlicerChart: React.FC<SlicerChartProps> = ({
  selectedDataset,
  setSelectedDataset,
  selectedYear,
  setSelectedYear,
  selectedSDG,
  setSelectedSDG,
}) => {
  const datasets = {
    dataset1: "Dataset 1",
    dataset2: "Dataset 2",
    dataset3: "Dataset 3",
  };

  const sdgs = {
    sdg1: "No Poverty",
    sdg2: "Zero Hunger",
    sdg3: "Good Health & Well-being",
    sdg4: "Quality Education",
  };

  return (
    <div className="p-4 space-y-4">
      {/* Dataset Dropdown */}
      <div>
        <label className="block mb-2 text-lg font-semibold">Select Dataset:</label>
        <select
          className="p-2 border rounded-md w-full"
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
        >
          {Object.entries(datasets).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* SDG Dropdown */}
      <div>
        <label className="block mb-2 text-lg font-semibold">Select SDG:</label>
        <select
          className="p-2 border rounded-md w-full"
          value={selectedSDG}
          onChange={(e) => setSelectedSDG(e.target.value)}
        >
          {Object.entries(sdgs).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Year Slider */}
      <div>
        <label className="block mb-2 text-lg font-semibold">Select Year: {selectedYear}</label>
        <input
          type="range"
          min={2020}
          max={2023}
          step={1}
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SlicerChart;
