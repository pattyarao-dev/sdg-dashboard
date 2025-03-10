"use client";

import React, { useEffect, useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import { ProgressBarChart, ProgressBarList } from "@/components/ProgressBarChart";
import ScoreCard from "@/components/Scorecard";
import { 
  transformSDGData, 
  DashboardSDG, 
  calculateSummaryMetrics, 
  calculateOverallProgress, 
  getMostRecentValue, 
  getAllIndicatorsData 
} from "@/utils/transformSDGData";

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

// Array of distinct colors for indicators
const indicatorColors = [
  "#E5243B", "#26BDE2", "#4C9F38", "#FD6925", "#FF3A21", "#FCC30B",
  "#A21942", "#DD1367", "#56C02B", "#00689D", "#3F7E44", "#0A97D9",
  "#BF8B2E", "#FD9D24", "#DDA63A", "#C5192D", "#19486A"
];

const Dashboard: React.FC = () => {
  const [sdgData, setSdgData] = useState<DashboardSDG[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the server action to get data directly
        const transformedData = await transformSDGData();
        setSdgData(transformedData);
      } catch (error) {
        console.error("Error fetching SDG data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedGoalData = sdgData.find((goal) => goal.goal_id === selectedGoalId) || null;
  
  // Get summary metrics and all indicators using imported functions
  const summaryMetrics = calculateSummaryMetrics(sdgData, selectedGoalData);
  const allIndicatorsData = getAllIndicatorsData(sdgData, sdgColors);

  // Handle gauge click to select a goal
  const handleGaugeClick = (goalId: number) => {
    if (selectedGoalId === goalId) {
      // Clicking the same goal again unselects it
      setSelectedGoalId(null);
      setSelectedIndicator("");
    } else {
      setSelectedGoalId(goalId);
      setSelectedIndicator("");
    }
  };

  // Function to convert indicators to the progress bar item format
  const convertToProgressBarItems = (indicators: any[], goalId?: number, goalTitle?: string) => {
    return indicators.map((indicator) => ({
      label: goalId ? `${indicator.name} (SDG ${goalId})` : indicator.name,
      progress: getMostRecentValue(indicator.current),
      target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
      onClick: goalId ? undefined : () => setSelectedIndicator(indicator.name)
    }));
  };

  if (loading) {
    return <div className="p-6">Loading SDG data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>
      
      {/* Summary Scorecards - Always displayed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ScoreCard 
          title="Overall Progress" 
          value={`${summaryMetrics.overallProgress}%`}
          subtitle={selectedGoalId ? `For SDG ${selectedGoalId}` : "All SDGs"}
          color={selectedGoalData ? sdgColors[selectedGoalData.title] : "#19486A"}
        />
        <ScoreCard 
          title="On Track Indicators" 
          value={`${summaryMetrics.onTrackIndicators}/${summaryMetrics.totalIndicators}`}
          subtitle="≥ 75% of target achieved"
          color="#4C9F38" // Green
        />
        <ScoreCard 
          title="At Risk Indicators" 
          value={`${summaryMetrics.atRiskIndicators}/${summaryMetrics.totalIndicators}`}
          subtitle="< 50% of target achieved"
          color="#E5243B" // Red
        />
      </div>
      
      {/* Second Row of Scorecards - More Detailed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ScoreCard 
          title="Total Metrics Tracked" 
          value={summaryMetrics.totalIndicators + summaryMetrics.totalSubIndicators}
          subtitle={`${summaryMetrics.totalIndicators} indicators, ${summaryMetrics.totalSubIndicators} sub-indicators`}
          color="#19486A" // Dark blue
        />
        <ScoreCard 
          title="Most Improved" 
          value={summaryMetrics.mostImprovedIndicator.name}
          subtitle={`+${summaryMetrics.mostImprovedIndicator.improvement.toFixed(1)}% (${summaryMetrics.mostImprovedIndicator.goalTitle})`}
          color="#56C02B" // Green
        />
        <ScoreCard 
          title="Needs Attention" 
          value={summaryMetrics.leastImprovedIndicator.name}
          subtitle={`${summaryMetrics.leastImprovedIndicator.improvement.toFixed(1)}% (${summaryMetrics.leastImprovedIndicator.goalTitle})`}
          color="#FD9D24" // Orange
        />
      </div>

      {/* SDG Goal Gauges as Filters */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">SDG Progress Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sdgData.map((goal) => (
            <div 
              key={goal.goal_id}
              className={`cursor-pointer transition-all duration-200 ${selectedGoalId === goal.goal_id ? 'scale-110 shadow-lg' : 'hover:scale-105'}`}
              onClick={() => handleGaugeClick(goal.goal_id)}
            >
              <div className="text-center mb-2 font-medium text-sm">
                SDG {goal.goal_id}: {goal.title}
              </div>
              <GaugeChart 
                value={calculateOverallProgress(goal)}
                min={0}
                max={100}
                title=""
                color={sdgColors[goal.title] || "blue"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Conditional rendering based on selection */}
      {selectedGoalId ? (
        // Detailed view for a selected SDG - Modified to have LineChart on LEFT, ProgressBars on RIGHT
        <>
          <h2 className="text-xl font-semibold mb-4">Details for SDG {selectedGoalId}: {selectedGoalData?.title}</h2>
          
          {/* Two-column layout with LineChart LEFT and ProgressBars RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Right column - Indicators progress bars */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Indicators</h3>
              {selectedGoalData && (
                <ProgressBarList 
                  items={selectedGoalData.indicators.map((indicator, index) => {
                    // Assign a color from the indicatorColors array based on the index
                    const colorIndex = index % indicatorColors.length;
                    return {
                      label: indicator.name,
                      progress: getMostRecentValue(indicator.current),
                      target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
                      onClick: () => setSelectedIndicator(indicator.name),
                      color: indicatorColors[colorIndex] // Apply unique color to each indicator
                    };
                  })}
                />
              )}
            </div>
            
            {/* Left column - Line Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Achievement Level Over Time</h3>
              {selectedGoalData && (
                <LineChart
                  data={selectedGoalData.indicators.map((indicator, index) => {
                    // Assign a color from the indicatorColors array based on the index
                    const colorIndex = index % indicatorColors.length;
                    return {
                      x: indicator.current.map(item => item.date),
                      y: indicator.current.map(item => 'value' in item ? item.value : item.current),
                      type: "scatter",
                      mode: "lines+markers",
                      marker: { color: indicatorColors[colorIndex] },
                      line: { color: indicatorColors[colorIndex] },
                      name: indicator.name,
                    };
                  })}
                />
              )}
            </div>
          </div>

          {/* Sub-indicators section (if an indicator is selected) - Full width below the two columns */}
          {selectedGoalData && selectedIndicator && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Sub-indicators for {selectedIndicator}</h2>
              {selectedGoalData.indicators
                .find((ind) => ind.name === selectedIndicator)
                ?.sub_indicators && (
                  <ProgressBarList 
                    items={
                      (selectedGoalData.indicators.find((ind) => ind.name === selectedIndicator)?.sub_indicators || [])
                      .map((sub, index) => {
                        // Assign a color from the indicatorColors array based on the index
                        const colorIndex = index % indicatorColors.length;
                        return {
                          label: sub.name,
                          progress: getMostRecentValue(sub.current),
                          target: typeof sub.target === "number" ? sub.target : sub.target[0],
                          color: indicatorColors[colorIndex] // Apply unique color to each sub-indicator
                        };
                      })
                    }
                  />
                )}
            </div>
          )}
          
          {/* "Back to Overview" button */}
          <button 
            onClick={() => {
              setSelectedGoalId(null);
              setSelectedIndicator("");
            }}
            className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Back to Overview
          </button>
        </>
      ) : (
        <>
          {/* Two-column layout for the overview - LineChart LEFT, ProgressBars RIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Right column - Progress bars */}
            <div>
              {/* Top Indicators */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Top Performing Indicators</h2>
                <ProgressBarList 
                  items={allIndicatorsData
                    .sort((a, b) => b.achievement_percentage - a.achievement_percentage)
                    .slice(0, 5)
                    .map((indicator, index) => {
                      // Assign a color from the indicatorColors array based on the index
                      const colorIndex = index % indicatorColors.length;
                      return {
                        label: `${indicator.name} (SDG ${indicator.goalId})`,
                        progress: getMostRecentValue(indicator.current),
                        target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
                        color: indicatorColors[colorIndex] // Apply unique color to each indicator
                      };
                    })}
                />
              </div>
              
              {/* Bottom Indicators */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Need Attention</h2>
                <ProgressBarList 
                  items={allIndicatorsData
                    .sort((a, b) => a.achievement_percentage - b.achievement_percentage)
                    .slice(0, 5)
                    .map((indicator, index) => {
                      // Assign a color from the indicatorColors array based on the index
                      const colorIndex = index % indicatorColors.length;
                      return {
                        label: `${indicator.name} (SDG ${indicator.goalId})`,
                        progress: getMostRecentValue(indicator.current),
                        target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
                        color: indicatorColors[colorIndex] // Apply unique color to each indicator
                      };
                    })}
                />
              </div>
            </div>
            
            {/* Left column - Line Chart */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Overall SDG Progress Over Time</h2>
              <LineChart
                data={sdgData.map((goal, index) => {
                  // For each goal, calculate the average achievement percentage by year
                  const allDates = goal.indicators.flatMap(ind => 
                    ind.current.map(item => item.date.split('-')[0]) // Extract year
                  );
                  
                  // Get unique years
                  const uniqueYears = [...new Set(allDates)].sort();
                  
                  // Calculate average achievement for each year
                  const yearlyAverages = uniqueYears.map(year => {
                    const yearData = goal.indicators.flatMap(ind => 
                      ind.current.filter(item => item.date.startsWith(year))
                        .map(item => 'value' in item ? item.value : item.current)
                    );
                    
                    return yearData.length > 0 
                      ? yearData.reduce((sum, val) => sum + val, 0) / yearData.length 
                      : 0;
                  });
                  
                  // Use the predefined color for the goal
                  const goalColor = sdgColors[goal.title] || indicatorColors[index % indicatorColors.length];
                  
                  return {
                    x: uniqueYears,
                    y: yearlyAverages,
                    type: "scatter",
                    mode: "lines+markers",
                    marker: { color: goalColor },
                    line: { color: goalColor },
                    name: `SDG ${goal.goal_id}: ${goal.title}`,
                  };
                })}
              />
            </div>
          </div>
        </>
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
