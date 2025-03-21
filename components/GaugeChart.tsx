"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface GoalSummary {
  goal_id: number;
  goal_name: string;
  count: number;
  avg_value: number;
  median_value: number;
  min_value: number;
  max_value: number;
  std_dev: number;
  unique_values: number;
  latest_value: number;
  latest_measurement_date: string;
  project_avg_value?: number;
  project_median_value?: number;
  project_min_value?: number;
  project_max_value?: number;
  project_values_count?: number;
}

// interface Goal {
//   goal_id: number;
//   goal_name: string;
//   color?: string;
// }

interface GaugeChartProps {
  goal_id: number; 
  title: string;
  color?: string;
  isActive?: boolean;
  onFilterChange?: (goal_id: number | null) => void;
  year?: number;
  month?: number;
  project_id?: number;
  location?: string;
  valueType?: 'latest_value' | 'avg_value' | 'median_value';
  // Default fallback value when no data is available
  defaultValue?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  goal_id,
  title,
  color,
  isActive = false,
  onFilterChange,
  year,
  month,
  project_id,
  location,
  valueType = 'latest_value',
  defaultValue = 0
}) => {
  const [goalData, setGoalData] = useState<GoalSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);

  useEffect(() => {
    const fetchGoalData = async () => {
      if (!goal_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Construct query parameters
        const params = new URLSearchParams();
        if (year) params.append('year', year.toString());
        if (month) params.append('month', month.toString());
        if (project_id) params.append('project_id', project_id.toString());
        if (location) params.append('location', location);
        
        const response = await fetch(`http://localhost:8000/api/indicators/goal-summary?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        
        const result = await response.json();
        const goalSummary = result.data.find((item: GoalSummary) => item.goal_id === goal_id);
        
        if (goalSummary) {
          setGoalData(goalSummary);
          setHasData(true);
        } else {
          // No data found but no error - just set hasData to false
          setHasData(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoalData();
  }, [goal_id, year, month, project_id, location]);

  const handleOnClick = () => {
    if (onFilterChange && goal_id !== undefined) {
      if (isActive) {
        onFilterChange(null);
      } else {
        onFilterChange(goal_id);
      }
    }
  };

  const getGaugeColor = (percentage: number) => {
    if (percentage < 50) return "#E5243B"; // Red (0-49%)
    if (percentage < 80) return "#FF9800"; // Orange (50-79%)
    return "#4CAF50"; // Green (80-100%)
  };
  
  // Display value to show on gauge (use goalData if available, otherwise use defaultValue)
  const displayValue = hasData && goalData ? goalData[valueType] : defaultValue;
  
  // Format percentage value, ensuring it's within 0-100
  const normalizedValue = Math.min(Math.max(displayValue, 0), 100);
  
  // Use provided color or determine by value
  const gaugeColor = color || getGaugeColor(normalizedValue);

  // Create Plotly data
  const data: Data[] = [
    {
      type: "indicator",
      mode: "gauge+number",
      value: normalizedValue,
      number: { suffix: "%" },
      title: { text: title, font: { size: 12 } },
      gauge: {
        axis: { range: [0, 100] },
        bar: { color: gaugeColor },
      },
    },
  ];

  const layout: Partial<Layout> = {
    width: 200,
    height: 150,
    margin: { t: 40, b: 10, l: 10, r: 10 },
  };

  if (isLoading) {
    return <div className="w-full h-32 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm p-2">Error: {error}</div>;
  }

  return (
    <div 
      onClick={handleOnClick} 
      style={{ 
        cursor: onFilterChange ? "pointer" : "default",
        opacity: isActive ? 1 : hasData ? 0.9 : 0.7, // Dimmed if no data
        border: isActive ? `2px solid ${gaugeColor}` : 'none',
        borderRadius: '8px',
        padding: '4px'
      }}
      className="transition-all duration-200 hover:opacity-100 hover:shadow-md"
    >
      <Plot data={data} layout={layout} config={{ displayModeBar: false }} />
      {!hasData && (
        <div className="text-xs text-center mt-1 text-gray-500">
          No data
        </div>
      )}
      {isActive && hasData && (
        <div className="text-xs text-center mt-1 font-medium" style={{ color: gaugeColor }}>
          Selected
        </div>
      )}
    </div>
  );
};

export default GaugeChart;