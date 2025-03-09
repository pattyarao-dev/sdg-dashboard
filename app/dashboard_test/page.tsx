"use client";

import React, { useEffect, useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import { ProgressBarChart, ProgressBarList } from "@/components/ProgressBarChart"; // Import both components
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

// Scorecard component for summary metrics
interface ScoreCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, value, subtitle, icon, color = "blue" }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};

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

  // Helper function to get the most recent value from date-based data
  const getMostRecentValue = (data: { date: string; value: number }[] | { date: string; current: number }[]): number => {
    if (!data || data.length === 0) return 0;
    
    // Sort by date descending to get the most recent first
    const sortedData = [...data].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Return the value of the most recent entry
    // Handle both data structure types
    return 'value' in sortedData[0] ? sortedData[0].value : sortedData[0].current;
  };
  
  // Calculate summary metrics for scorecards (for all goals or selected goal)
  const calculateSummaryMetrics = (allData: DashboardSDG[], selectedGoal: DashboardSDG | null) => {
    // If a goal is selected, use its data; otherwise, aggregate data from all goals
    const dataToProcess = selectedGoal ? [selectedGoal] : allData;
    
    // Get all indicators across all goals or just the selected goal
    const allIndicators = dataToProcess.flatMap(goal => goal.indicators);
    
    // Count total indicators and sub-indicators
    const totalIndicators = allIndicators.length;
    const totalSubIndicators = allIndicators.reduce(
      (sum, ind) => sum + (ind.sub_indicators?.length || 0), 
      0
    );
    
    // Find indicators that are on track (>= 75% of target)
    const onTrackIndicators = allIndicators.filter(
      ind => ind.achievement_percentage >= 75
    ).length;
    
    // Find indicators that need attention (< 50% of target)
    const atRiskIndicators = allIndicators.filter(
      ind => ind.achievement_percentage < 50
    ).length;
    
    // Calculate year-over-year growth rate for indicators
    let avgYoyGrowth = 0;
    let indicatorsWithGrowth = 0;
    
    allIndicators.forEach(ind => {
      if (ind.current.length < 2) return;
      
      // Sort current values by date
      const sortedValues = [...ind.current].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Need at least 2 values to calculate growth
      if (sortedValues.length >= 2) {
        const oldestValue = 'value' in sortedValues[0] ? sortedValues[0].value : sortedValues[0].current;
        const latestValue = 'value' in sortedValues[sortedValues.length - 1] 
          ? sortedValues[sortedValues.length - 1].value 
          : sortedValues[sortedValues.length - 1].current;
        
        if (oldestValue > 0) {
          const growth = ((latestValue - oldestValue) / oldestValue) * 100;
          avgYoyGrowth += growth;
          indicatorsWithGrowth++;
        }
      }
    });
    
    avgYoyGrowth = indicatorsWithGrowth > 0 ? avgYoyGrowth / indicatorsWithGrowth : 0;
    
    // Find most and least improved indicators
    let mostImprovedIndicator = { name: "N/A", improvement: 0, goalTitle: "N/A" };
    let leastImprovedIndicator = { name: "N/A", improvement: 0, goalTitle: "N/A" };
    
    dataToProcess.forEach(goal => {
      goal.indicators.forEach(ind => {
        if (ind.current.length < 2) return;
        
        // Sort current values by date
        const sortedValues = [...ind.current].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Need at least 2 values to calculate improvement
        if (sortedValues.length >= 2) {
          const oldestValue = 'value' in sortedValues[0] ? sortedValues[0].value : sortedValues[0].current;
          const latestValue = 'value' in sortedValues[sortedValues.length - 1] 
            ? sortedValues[sortedValues.length - 1].value 
            : sortedValues[sortedValues.length - 1].current;
          
          if (oldestValue > 0) {
            const improvement = ((latestValue - oldestValue) / oldestValue) * 100;
            
            if (improvement > mostImprovedIndicator.improvement) {
              mostImprovedIndicator = { 
                name: ind.name, 
                improvement,
                goalTitle: goal.title
              };
            }
            
            if (leastImprovedIndicator.name === "N/A" || improvement < leastImprovedIndicator.improvement) {
              leastImprovedIndicator = { 
                name: ind.name, 
                improvement,
                goalTitle: goal.title
              };
            }
          }
        }
      });
    });
    
    // Calculate overall progress across all goals or for the selected goal
    const overallProgress = calculateOverallProgressAcrossGoals(dataToProcess);
    
    return {
      totalIndicators,
      totalSubIndicators,
      onTrackIndicators,
      atRiskIndicators,
      avgYoyGrowth: avgYoyGrowth.toFixed(1),
      mostImprovedIndicator,
      leastImprovedIndicator,
      overallProgress
    };
  };
  
  // Calculate overall progress for a single goal
  function calculateOverallProgress(goalData: DashboardSDG): number {
    if (!goalData.indicators.length) return 0;
    
    const totalAchievement = goalData.indicators.reduce(
      (sum, indicator) => sum + indicator.achievement_percentage, 
      0
    );
    
    return Math.round(totalAchievement / goalData.indicators.length);
  }
  
  // Calculate overall progress across multiple goals
  function calculateOverallProgressAcrossGoals(goalsData: DashboardSDG[]): number {
    if (!goalsData.length) return 0;
    
    const allIndicators = goalsData.flatMap(goal => goal.indicators);
    if (!allIndicators.length) return 0;
    
    const totalAchievement = allIndicators.reduce(
      (sum, indicator) => sum + indicator.achievement_percentage, 
      0
    );
    
    return Math.round(totalAchievement / allIndicators.length);
  }
  
  // Get aggregate data for all indicators across all goals
  const getAllIndicatorsData = () => {
    return sdgData.flatMap(goal => 
      goal.indicators.map(indicator => ({
        ...indicator,
        goalId: goal.goal_id,
        goalTitle: goal.title,
        goalColor: sdgColors[goal.title] || "blue"
      }))
    );
  };
  
  const summaryMetrics = calculateSummaryMetrics(sdgData, selectedGoalData);
  const allIndicatorsData = getAllIndicatorsData();

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
                  items={convertToProgressBarItems(selectedGoalData.indicators)}
                />
              )}
            </div>
            
            {/* Left column - Line Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Achievement Level Over Time</h3>
              {selectedGoalData && (
                <LineChart
                  data={selectedGoalData.indicators.map((indicator) => ({
                    x: indicator.current.map(item => item.date),
                    y: indicator.current.map(item => 'value' in item ? item.value : item.current),
                    type: "scatter",
                    mode: "lines+markers",
                    marker: { color: sdgColors[selectedGoalData.title] || "blue" },
                    line: { color: sdgColors[selectedGoalData.title] || "blue" },
                    name: indicator.name,
                  }))}
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
                    items={convertToProgressBarItems(
                      selectedGoalData.indicators.find((ind) => ind.name === selectedIndicator)?.sub_indicators || []
                    )}
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
                    .map((indicator) => ({
                      label: `${indicator.name} (SDG ${indicator.goalId})`,
                      progress: getMostRecentValue(indicator.current),
                      target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
                    }))}
                />
              </div>
              
              {/* Bottom Indicators */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Need Attention</h2>
                <ProgressBarList 
                  items={allIndicatorsData
                    .sort((a, b) => a.achievement_percentage - b.achievement_percentage)
                    .slice(0, 5)
                    .map((indicator) => ({
                      label: `${indicator.name} (SDG ${indicator.goalId})`,
                      progress: getMostRecentValue(indicator.current),
                      target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
                    }))}
                />
              </div>
            </div>
            
            {/* Left column - Line Chart */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Overall SDG Progress Over Time</h2>
              <LineChart
                data={sdgData.map((goal) => {
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
                  
                  return {
                    x: uniqueYears,
                    y: yearlyAverages,
                    type: "scatter",
                    mode: "lines+markers",
                    marker: { color: sdgColors[goal.title] || "blue" },
                    line: { color: sdgColors[goal.title] || "blue" },
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
