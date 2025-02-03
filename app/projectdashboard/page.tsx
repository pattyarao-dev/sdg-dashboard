"use client";

import React, { useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import SlicerChart from "@/components/SlicerChart";
import ProgressBarChart from "@/components/ProgressBarChart";
import TreemapChart from "@/components/TreemapChart";

const projectData = {
  projectName: "LGU Environmental Initiative",
  sdgs: [
    { id: 1, name: "SDG 1: No Poverty", progress: 75 },
    { id: 2, name: "SDG 2: Zero Hunger", progress: 60 },
    { id: 3, name: "SDG 3: Good Health", progress: 80 },
  ],
  indicators: [
    { id: 1, name: "Indicator 1.1", progress: 50 },
    { id: 2, name: "Indicator 2.1", progress: 65 },
    { id: 3, name: "Indicator 3.1", progress: 85 },
  ],
  history: {
    years: [2020, 2021, 2022, 2023],
    values: [30, 45, 60, 75],
  },
};

const ProjectSDGDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2020);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "20px" }}>
      <h1>Project-Level SDG Dashboard</h1>
      <h2>{projectData.projectName}</h2>

      {/* Year Slicer */}
      <SlicerChart
        selectedDataset={"project"}
        setSelectedDataset={() => {}}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      {/* Line Chart for SDG Achievement Over Time */}
      <LineChart
        data={[{
          x: projectData.history.years,
          y: projectData.history.values,
          type: "scatter",
          mode: "lines+markers",
          name: "Achievement Progress",
        }]}
        title="SDG Achievement Over Time"
      />

      {/* Gauges for SDG Progress */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "20px" }}>
        {projectData.sdgs.map((sdg) => (
          <GaugeChart key={sdg.id} title={sdg.name} value={sdg.progress} color="#4caf50" />
        ))}
      </div>

      {/* Progress Bars for Indicators */}
      <div style={{ marginTop: "20px" }}>
        <h2>Indicator Progress</h2>
        {projectData.indicators.map((indicator) => (
          <ProgressBarChart key={indicator.id} title={indicator.name} value={indicator.progress} />
        ))}
      </div>

      {/* Treemap for Indicator Contribution */}
      <TreemapChart
        data={projectData.indicators.map(indicator => ({
          label: indicator.name,
          value: indicator.progress,
        }))}
        title="Indicator Contribution to Project"
      />
    </div>
  );
};

export default ProjectSDGDashboard;
