"use client";

import React, { useEffect, useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import SlicerChart from "@/components/SlicerChart";
import ProgressBarChart from "@/components/ProgressBarChart";
import DonutChart from "@/components/DonutChart";
import ChoroplethMap from "@/components/ChoroplethMap";
import { fetchSDGData } from "@/utils/fetchData";
import { transformSDGData, DashboardSDG } from "@/utils/transformSDGData";

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
  const [sdgData, setSdgData] = useState<DashboardSDG[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiData = await fetchSDGData();
        if (apiData) {
          const transformedData = transformSDGData(apiData);
          setSdgData(transformedData);
          if (transformedData.length > 0) {
            setSelectedGoalId(transformedData[0].goal_id);
          }
        }
      } catch (error) {
        console.error("Error fetching SDG data:", error);
      }
    };

    fetchData();
  }, []);

  const selectedGoalData = sdgData.find((goal) => goal.goal_id === selectedGoalId) || null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>

      {/* Goal Selector */}
      <select
        value={selectedGoalId || ""}
        onChange={(e) => setSelectedGoalId(Number(e.target.value))}
        className="border p-2 rounded"
      >
        {sdgData.map((goal) => (
          <option key={goal.goal_id} value={goal.goal_id}>
            {goal.title}
          </option>
        ))}
      </select>

      {/* Display Indicators */}
      {selectedGoalData && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Indicators for {selectedGoalData.title}</h2>
          {selectedGoalData.indicators.map((indicator) => (
            <ProgressBarChart
              key={indicator.name}
              label={indicator.name}
              progress={indicator.current.length > 0 ? indicator.current[indicator.current.length - 1] : 0}
              target={typeof indicator.target === "number" ? indicator.target : indicator.target[0]}
              onClick={() => setSelectedIndicator(indicator.name)}
            />
          ))}
        </div>
      )}

      {/* Line Chart for Goal Achievement */}
      {selectedGoalData && (
        <div className="mt-6">
          <h2>SDG {selectedGoalData.goal_id} Achievement Level by Year</h2>
          <LineChart
            data={selectedGoalData.indicators.map((indicator) => ({
              x: indicator.current.map((_, index) => 2020 + index),
              y: indicator.current,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: sdgColors[selectedGoalData.title] || "blue" },
              line: { color: sdgColors[selectedGoalData.title] || "blue" },
              name: indicator.name,
            }))}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;


// "use client";

// import { useEffect, useState } from "react";
// import { fetchSDGData, Indicator, Goal } from "@/utils/fetchData";

// export default function DashboardPage() {
//   const [indicators, setIndicators] = useState<Indicator[]>([]);
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

//   useEffect(() => {
//     const getData = async () => {
//       const data = await fetchSDGData();
//       if (data) {
//         setIndicators(data.indicators);
//         setGoals(data.goals);
//         setSelectedGoal(data.goals.length > 0 ? data.goals[0].goal_id : null);
//       }
//     };

//     getData();
//   }, []);

//   const filteredIndicators = indicators.filter((indicator) =>
//     indicator.td_goal_indicator.some((goalIndicator) => goalIndicator.goal_id === selectedGoal)
//   );

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">SDG Dashboard</h1>

//       {/* Goal Selector */}
//       <select
//         value={selectedGoal || ""}
//         onChange={(e) => setSelectedGoal(Number(e.target.value))}
//         className="border p-2 rounded"
//       >
//         {goals.map((goal) => (
//           <option key={goal.goal_id} value={goal.goal_id}>
//             {goal.name}
//           </option>
//         ))}
//       </select>

//       <div className="mt-4">
//         {selectedGoal && (
//           <h2 className="text-lg font-semibold">
//             Selected Goal: {goals.find((g) => g.goal_id === selectedGoal)?.name}
//           </h2>
//         )}
//       </div>

//       {/* Indicators for the selected goal */}
//       <div className="mt-4">
//         {filteredIndicators.length === 0 ? (
//           <p>No indicators available for this goal.</p>
//         ) : (
//           filteredIndicators.map((indicator) => (
//             <div key={indicator.indicator_id} className="border p-4 mb-2 rounded-lg">
//               <h3 className="font-semibold">{indicator.name}</h3>
//               <p>{indicator.description}</p>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
