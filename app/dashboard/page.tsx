"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import GaugeChart from "@/components/GaugeChart";
import LineChart from "@/components/LineChart";
import { ProgressBarList } from "@/components/ProgressBarChart";
import ScoreCard from "@/components/ScoreCardChart";
import { 
  transformSDGData, 
  calculateSummaryMetrics, 
  calculateOverallProgress, 
  getMostRecentValue, 
  getAllIndicatorsData 
} from "@/utils/transformSDGData";

// SDG colors
const sdgColors = {
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

// Move indicator colors
const indicatorColors = [
  "#E5243B", "#26BDE2", "#4C9F38", "#FD6925", "#FF3A21", "#FCC30B",
  "#A21942", "#DD1367", "#56C02B", "#00689D", "#3F7E44", "#0A97D9",
  "#BF8B2E", "#FD9D24", "#DDA63A", "#C5192D", "#19486A"
];

// Month names array (moved outside component)
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Date Filter Component (memoized)
const DateFilter = React.memo(({ 
  availableYears, 
  availableMonths, 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange, 
  onResetFilters 
}) => (
  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6 p-4 bg-gray-50 rounded-lg">
    <div>
      <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
      <select 
        id="year-filter"
        value={selectedYear || "all"} 
        onChange={(e) => onYearChange(e.target.value === "all" ? null : e.target.value)}
        className="border border-gray-300 rounded-md p-2 bg-white"
      >
        <option value="all">All Years</option>
        {availableYears.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
    
    <div>
      <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
      <select 
        id="month-filter"
        value={selectedMonth || "all"} 
        onChange={(e) => onMonthChange(e.target.value === "all" ? null : e.target.value)}
        className="border border-gray-300 rounded-md p-2 bg-white"
        disabled={!selectedYear}
      >
        <option value="all">All Months</option>
        {availableMonths.map(month => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>
    </div>
    
    <button 
      onClick={onResetFilters}
      className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
    >
      Reset Filters
    </button>
    
    {(selectedYear || selectedMonth) && (
      <div className="mt-6 ml-auto py-2 px-4 bg-blue-50 border border-blue-200 rounded-md">
        <span className="text-sm text-blue-800">
          {!selectedMonth && selectedYear && `Showing data for ${selectedYear}`}
          {selectedMonth && selectedYear && `Showing data for ${selectedMonth} ${selectedYear}`}
        </span>
      </div>
    )}
  </div>
));

// Memoized SDG Gauges component
const SDGGauges = React.memo(({ sdgData, selectedGoalId, onGaugeClick }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {sdgData.map((goal) => (
      <div 
        key={goal.goal_id}
        className={`cursor-pointer transition-all duration-200 ${selectedGoalId === goal.goal_id ? 'scale-110 shadow-lg' : 'hover:scale-105'}`}
        onClick={() => onGaugeClick(goal.goal_id)}
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
));

// Memoized Summary Cards component
const SummaryCards = React.memo(({ summaryMetrics, selectedGoalId, selectedGoalData }) => (
  <>
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
  </>
));

// Memoized Indicator Progress Bar List component
const IndicatorProgressBars = React.memo(({ indicators, onSelectIndicator, colorOffset = 0, selectedIndicator }) => (
  <ProgressBarList 
    items={indicators.map((indicator, index) => {
      const colorIndex = (index + colorOffset) % indicatorColors.length;
      return {
        label: indicator.label || indicator.name,
        progress: indicator.progress || getMostRecentValue(indicator.current),
        target: typeof indicator.target === "number" ? indicator.target : indicator.target[0],
        onClick: onSelectIndicator ? () => onSelectIndicator(indicator.name) : undefined,
        color: indicatorColors[colorIndex],
        selected: selectedIndicator === indicator.name
      };
    })}
  />
));

// Helper function to extract all unique years and months from data
const extractDateOptions = (sdgData) => {
  const years = new Set();
  const months = new Set();
  
  sdgData.forEach(goal => {
    goal.indicators.forEach(indicator => {
      indicator.current.forEach(dataPoint => {
        if (dataPoint.date) {
          const [year, month] = dataPoint.date.split('-');
          years.add(year);
          if (month) {
            const monthIndex = parseInt(month, 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              months.add(monthNames[monthIndex]);
            }
          }
        }
      });
      
      if (indicator.sub_indicators) {
        indicator.sub_indicators.forEach(subInd => {
          subInd.current.forEach(dataPoint => {
            if (dataPoint.date) {
              const [year, month] = dataPoint.date.split('-');
              years.add(year);
              if (month) {
                const monthIndex = parseInt(month, 10) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                  months.add(monthNames[monthIndex]);
                }
              }
            }
          });
        });
      }
    });
  });
  
  return {
    years: Array.from(years).sort(),
    months: Array.from(months)
  };
};

// Helper function to filter data by date
const filterDataByDate = (data, selectedYear, selectedMonth) => {
  if (!selectedYear && !selectedMonth) return data;
  
  const monthIndex = selectedMonth ? monthNames.indexOf(selectedMonth) + 1 : null;
  const monthStr = monthIndex ? String(monthIndex).padStart(2, '0') : null;
  
  // Create a deep copy of the data to avoid mutating the original
  const filteredData = JSON.parse(JSON.stringify(data));
  
  filteredData.forEach(goal => {
    // Filter indicator data
    goal.indicators.forEach(indicator => {
      indicator.current = indicator.current.filter(dataPoint => {
        const [year, month] = dataPoint.date.split('-');
        return (
          (!selectedYear || year === selectedYear) && 
          (!monthStr || month === monthStr)
        );
      });
      
      // Recalculate achievement percentage based on filtered data
      if (indicator.current.length > 0) {
        const latestValue = getMostRecentValue(indicator.current);
        indicator.achievement_percentage = Math.min(
          Math.round((latestValue / indicator.target) * 100),
          100
        );
      }
      
      // Filter sub-indicators data if they exist
      if (indicator.sub_indicators) {
        indicator.sub_indicators.forEach(subInd => {
          subInd.current = subInd.current.filter(dataPoint => {
            const [year, month] = dataPoint.date.split('-');
            return (
              (!selectedYear || year === selectedYear) && 
              (!monthStr || month === monthStr)
            );
          });
          
          // Recalculate achievement percentage based on filtered data
          if (subInd.current.length > 0) {
            const latestValue = getMostRecentValue(subInd.current);
            subInd.achievement_percentage = Math.min(
              Math.round((latestValue / subInd.target) * 100),
              100
            );
          }
        });
      }
    });
    
    // Filter goal's global values
    goal.global_current_value = goal.global_current_value.filter(dataPoint => {
      const [year, month] = dataPoint.date.split('-');
      return (
        (!selectedYear || year === selectedYear) && 
        (!monthStr || month === monthStr)
      );
    });
  });
  
  return filteredData;
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [sdgData, setSdgData] = useState<DashboardSDG[]>([]);
  const [filteredSdgData, setFilteredSdgData] = useState<DashboardSDG[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  // Date filter states
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
  // Extract date options once when data loads
  const dateOptions = useMemo(() => {
    return sdgData.length > 0 ? extractDateOptions(sdgData) : { years: [], months: [] };
  }, [sdgData]);

  // Fetch data only once at component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const transformedData = await transformSDGData();
        setSdgData(transformedData);
        setFilteredSdgData(transformedData);
      } catch (error) {
        console.error("Error fetching SDG data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Apply filters when date selection changes
  useEffect(() => {
    if (sdgData.length > 0) {
      const filtered = filterDataByDate(sdgData, selectedYear, selectedMonth);
      setFilteredSdgData(filtered);
    }
  }, [sdgData, selectedYear, selectedMonth]);

  // Memoize selected goal data
  const selectedGoalData = useMemo(() => 
    filteredSdgData.find((goal) => goal.goal_id === selectedGoalId) || null, 
    [filteredSdgData, selectedGoalId]
  );
  
  // Memoize summary metrics calculation 
  const summaryMetrics = useMemo(() => 
    calculateSummaryMetrics(filteredSdgData, selectedGoalData),
    [filteredSdgData, selectedGoalData]
  );
  
  // Memoize indicators data
  const allIndicatorsData = useMemo(() => 
    getAllIndicatorsData(filteredSdgData, sdgColors),
    [filteredSdgData]
  );

  // Memoize event handlers
  const handleGaugeClick = useCallback((goalId: number) => {
    setSelectedGoalId(prevId => prevId === goalId ? null : goalId);
    setSelectedIndicator("");
  }, []);

  const handleSelectIndicator = useCallback((indicatorName: string) => {
    setSelectedIndicator(prevIndicator => prevIndicator === indicatorName ? "" : indicatorName);
  }, []);
  
  const handleYearChange = useCallback((year: string | null) => {
    setSelectedYear(year);
    if (!year) setSelectedMonth(null);
  }, []);
  
  const handleMonthChange = useCallback((month: string | null) => {
    setSelectedMonth(month);
  }, []);
  
  const handleResetFilters = useCallback(() => {
    setSelectedYear(null);
    setSelectedMonth(null);
  }, []);

  // Memoize filtered performance indicators
  const topPerformingIndicators = useMemo(() => 
    allIndicatorsData
      .sort((a, b) => b.achievement_percentage - a.achievement_percentage)
      .slice(0, 5),
    [allIndicatorsData]
  );

  const needAttentionIndicators = useMemo(() => 
    allIndicatorsData
      .sort((a, b) => a.achievement_percentage - b.achievement_percentage)
      .slice(0, 5),
    [allIndicatorsData]
  );

  // Memoize chart data
  const selectedGoalChartData = useMemo(() => {
    if (!selectedGoalData) return [];
    
    // If an indicator is selected, only show that indicator in the chart
    if (selectedIndicator) {
      const selectedIndicatorObj = selectedGoalData.indicators.find(ind => ind.name === selectedIndicator);
      if (!selectedIndicatorObj) return [];
      
      return [{
        x: selectedIndicatorObj.current.map(item => item.date),
        y: selectedIndicatorObj.current.map(item => 'value' in item ? item.value : item.current),
        type: "scatter",
        mode: "lines+markers",
        marker: { color: indicatorColors[0] },
        line: { color: indicatorColors[0] },
        name: selectedIndicatorObj.name,
      }];
    }
    
    // Otherwise, show all indicators
    return selectedGoalData.indicators.map((indicator, index) => {
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
    });
  }, [selectedGoalData, selectedIndicator]);

  // Memoize sub-indicator chart data for the selected indicator
  const selectedSubIndicatorsChartData = useMemo(() => {
    if (!selectedGoalData || !selectedIndicator) return [];
    
    const selectedIndicatorObj = selectedGoalData.indicators.find(ind => ind.name === selectedIndicator);
    if (!selectedIndicatorObj || !selectedIndicatorObj.sub_indicators) return [];
    
    return selectedIndicatorObj.sub_indicators.map((subInd, index) => {
      const colorIndex = (index + 3) % indicatorColors.length; // Offset to use different colors
      return {
        x: subInd.current.map(item => item.date),
        y: subInd.current.map(item => 'value' in item ? item.value : item.current),
        type: "scatter",
        mode: "lines+markers",
        marker: { color: indicatorColors[colorIndex] },
        line: { color: indicatorColors[colorIndex] },
        name: subInd.name,
      };
    });
  }, [selectedGoalData, selectedIndicator]);

  // Memoize overall SDG progress for LineChart
  const overallSDGChartData = useMemo(() => {
    return filteredSdgData.map((goal, index) => {
      // Extract unique years and calculate averages
      const allDates = goal.indicators.flatMap(ind => 
        ind.current
          .filter(item => item?.date) // Ensure item and item.date exist
          .map(item => item.date.split('-')[0]) 
      );
  
      const uniqueYears = [...new Set(allDates)].sort();
  
      const yearlyAverages = uniqueYears.map(year => {
        const yearData = goal.indicators.flatMap(ind => 
          ind.current
            .filter(item => item?.date?.startsWith(year)) // Ensure date exists
            .map(item => ('value' in item ? item.value : item.current))
        );
  
        return yearData.length > 0 
          ? yearData.reduce((sum, val) => sum + val, 0) / yearData.length 
          : 0;
      });
      
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
    });
  }, [filteredSdgData]);

  if (loading) {
    return <div className="p-6">Loading SDG data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">LGU SDG Dashboard</h1>
      
      {/* Date Filter Component */}
      <DateFilter 
        availableYears={dateOptions.years} 
        availableMonths={dateOptions.months}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        onResetFilters={handleResetFilters}
      />
      
      {/* Summary Scorecards */}
      <SummaryCards 
        summaryMetrics={summaryMetrics} 
        selectedGoalId={selectedGoalId} 
        selectedGoalData={selectedGoalData} 
      />
      
      {/* SDG Goal Gauges */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">SDG Progress Overview</h2>
        <SDGGauges 
          sdgData={filteredSdgData}
          selectedGoalId={selectedGoalId}
          onGaugeClick={handleGaugeClick}
        />
      </div>

      {/* Conditional rendering based on selection */}
      {selectedGoalId ? (
        // Detailed view for a selected SDG
        <>
          <h2 className="text-xl font-semibold mb-4">
            Details for SDG {selectedGoalId}: {selectedGoalData?.title}
            {selectedIndicator && ` → ${selectedIndicator}`}
          </h2>
          
          {/* Filter context indication */}
          {(selectedYear || selectedMonth) && (
            <div className="mb-4 py-2 px-4 bg-blue-50 border border-blue-200 rounded-md inline-block">
              <span className="text-sm text-blue-800">
                {!selectedMonth && selectedYear && `Showing data for ${selectedYear}`}
                {selectedMonth && selectedYear && `Showing data for ${selectedMonth} ${selectedYear}`}
              </span>
            </div>
          )}
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Indicators progress bars */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {selectedIndicator ? `${selectedIndicator} Sub-Indicators` : "Indicators"}
                {selectedIndicator && (
                  <button 
                    onClick={() => setSelectedIndicator("")}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    (Back to all indicators)
                  </button>
                )}
              </h3>
              
              {selectedIndicator ? (
                // Show sub-indicators if an indicator is selected
                selectedGoalData && 
                selectedGoalData.indicators.find(ind => ind.name === selectedIndicator)?.sub_indicators &&
                selectedGoalData.indicators.find(ind => ind.name === selectedIndicator)?.sub_indicators.length > 0 ? (
                  <IndicatorProgressBars 
                    indicators={selectedGoalData.indicators.find(ind => ind.name === selectedIndicator)?.sub_indicators || []}
                    colorOffset={3}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md text-gray-600">
                    No sub-indicator data available for {selectedIndicator}.
                  </div>
                )
              ) : (
                // Show all indicators if no indicator is selected
                selectedGoalData && selectedGoalData.indicators.length > 0 ? (
                  <IndicatorProgressBars 
                    indicators={selectedGoalData.indicators}
                    onSelectIndicator={handleSelectIndicator}
                    selectedIndicator={selectedIndicator}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md text-gray-600">
                    No indicator data available for the selected time period.
                  </div>
                )
              )}
            </div>
            
            {/* Line Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {selectedIndicator 
                  ? `${selectedIndicator} Achievement Level` 
                  : "Indicators Achievement Level Over Time"}
              </h3>
              {selectedGoalData && selectedGoalChartData.length > 0 ? (
                <LineChart data={selectedGoalChartData} />
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-gray-600">
                  No time series data available for the selected time period.
                </div>
              )}

              {/* Sub-indicators Chart section - Only show when an indicator is selected */}
                {selectedIndicator && selectedSubIndicatorsChartData.length > 0 && (
                    <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Sub-indicators Achievement Level Over Time</h3>
                    <LineChart data={selectedSubIndicatorsChartData} />
                    </div>
                )}
            </div>
          </div>
          
          {/* Back button */}
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
          {/* Overview layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Progress bars column */}
            <div>
              {/* Top Indicators */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Top Performing Indicators</h2>
                {topPerformingIndicators.length > 0 ? (
                  <IndicatorProgressBars 
                    indicators={topPerformingIndicators.map(indicator => ({
                      ...indicator,
                      label: `${indicator.name} (SDG ${indicator.goalId})`
                    }))}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md text-gray-600">
                    No indicator data available for the selected time period.
                  </div>
                )}
              </div>
              
              {/* Bottom Indicators */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Need Attention</h2>
                {needAttentionIndicators.length > 0 ? (
                  <IndicatorProgressBars 
                    indicators={needAttentionIndicators.map(indicator => ({
                      ...indicator,
                      label: `${indicator.name} (SDG ${indicator.goalId})`
                    }))}
                    colorOffset={5}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-md text-gray-600">
                    No indicator data available for the selected time period.
                  </div>
                )}
              </div>
            </div>
            
            {/* Line Chart column */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Overall SDG Progress Over Time</h2>
              {overallSDGChartData.length > 0 && overallSDGChartData.some(item => item.x.length > 0) ? (
                <LineChart data={overallSDGChartData} />
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-gray-600">
                  No time series data available for the selected time period.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;