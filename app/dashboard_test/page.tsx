"use client";

import { useEffect, useState } from "react";
import { fetchSDGData, Indicator } from "@/utils/fetchData";

export default function DashboardPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchSDGData();
      if (data) {
        setIndicators(data.indicators);
      }
    };

    getData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-4">
        {indicators.length === 0 ? (
          <p>Loading data...</p>
        ) : (
          indicators.map((indicator) => (
            <div key={indicator.indicator_id} className="border p-4 mb-2 rounded-lg">
              <h2 className="font-semibold">{indicator.name}</h2>
              <p>{indicator.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



// "use client";

// import React, { useEffect, useState } from "react";
// import LineChart from "@/components/LineChart";

// const sdgColors: { [key: string]: string } = {
//   "No Poverty": "#E5243B",
//   "Zero Hunger": "#DDA63A",
//   "Good Health and Well-being": "#4C9F38",
//   "Quality Education": "#C5192D",
//   "Gender Equality": "#FF3A21",
//   "Clean Water and Sanitation": "#26BDE2",
//   "Affordable and Clean Energy": "#FCC30B",
//   "Decent Work and Economic Growth": "#A21942",
//   "Industry, Innovation and Infrastructure": "#FD6925",
//   "Reduced Inequalities": "#DD1367",
//   "Sustainable Cities and Communities": "#FD9D24",
//   "Responsible Consumption and Production": "#BF8B2E",
//   "Climate Action": "#3F7E44",
//   "Life Below Water": "#0A97D9",
//   "Life on Land": "#56C02B",
//   "Peace, Justice and Strong Institutions": "#00689D",
//   "Partnerships for the Goals": "#19486A",
// };

// const Dashboard: React.FC = () => {


//   useEffect(() => {
//     // Fetch and format the SDG data
// const fetchData = async () => {
//   try {
//     const res = await fetch("http://localhost:8000/extract-indicators");
//     if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

//     const data: { indicators: Indicator[] } = await res.json();
//     console.log("Fetched SDG Data:", data);

//     if (!data?.indicators?.length) {
//       console.error("No indicators found in API response");
//       return;
//     }

//     // Group by goal_id
//     const groupedGoals: Record<number, FormattedGoal> = data.indicators.reduce(
//       (acc, indicator) => {
//         indicator.td_goal_indicator.forEach((goalIndicator) => {
//           const goalId = goalIndicator.goal_id;
//           const goalName = goalIndicator.md_goal?.name || "Unknown Goal";

//           if (!acc[goalId]) {
//             acc[goalId] = { goal_id: goalId, goal_name: goalName, indicators: [] };
//           }

//           acc[goalId].indicators.push({
//             indicator_id: indicator.indicator_id,
//             name: indicator.name,
//             description: indicator.description,
//             values: goalIndicator.td_indicator_value || [],
//           });
//         });

//         return acc;
//       },
//       {} as Record<number, FormattedGoal> // Explicitly type `acc`
//     );

//       const formattedGoals = Object.values(groupedGoals);
//       console.log("Formatted SDG Goals:", formattedGoals);

//       setSdgData(formattedGoals);
//       setSelectedSDG(formattedGoals[0]?.goal_id?.toString() || null);
//     } catch (error) {
//       console.error("Error fetching SDG data:", error);
//     }
//   };
//     fetchData();
//   }, []);

//   const [sdgData, setSdgData] = useState<FormattedGoal[]>([]);
//   const [selectedSDG, setSelectedSDG] = useState<string | null>(null);

//   const selectedGoalData = sdgData.find((goal) => goal.goal_id.toString() === selectedSDG);
  
// //     const barangayData = dummySDGData.find((sdg) =>
// //     sdg.location_data?.some((loc: any) => loc.barangay === selectedBarangay)
// //   );

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>

//       {/* SDG Dropdown Selector */}
//       <select
//       value={selectedSDG || ""}
//       onChange={(e) => setSelectedSDG(e.target.value)}
//       className="border p-2 rounded"
//     >
//       {sdgData.map((goal) => (
//         <option key={goal.goal_id} value={goal.goal_id}>
//           {goal.goal_name}
//         </option>
//       ))}
//     </select>

//     // Fix selected goal display
//     <div className="mt-4">
//       {selectedSDG && (
//         <p className="text-lg font-semibold">
//           Selected Goal: {selectedGoalData?.goal_name}
//         </p>
//       )}
//     </div>


//       {/* Chart Component */}
//       <div className="mt-6">
//         <LineChart 
//             data={sdgData}
//             // target={selectedSDGData.global_target_value}
//               onClick={(event) => {
//                 if (event?.points?.length) {
//                 }
//               }} />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
