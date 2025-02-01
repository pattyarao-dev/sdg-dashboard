"use client";

import React from "react";

interface SlicerChartProps {
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const SlicerChart: React.FC<SlicerChartProps> = ({
  selectedDataset,
  setSelectedDataset,
  selectedYear,
  setSelectedYear,
}) => {
  const datasets = {
    dataset1: "Dataset 1",
    dataset2: "Dataset 2",
    dataset3: "Dataset 3",
  };

  return (
    <div className="p-4">
      {/* Dataset Dropdown */}
      <label className="block mb-2 text-lg font-semibold">Select Dataset:</label>
      <select
        className="p-2 border rounded-md mb-4"
        value={selectedDataset}
        onChange={(e) => setSelectedDataset(e.target.value)}
      >
        {Object.entries(datasets).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      {/* Year Slider */}
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
  );
};

export default SlicerChart;
