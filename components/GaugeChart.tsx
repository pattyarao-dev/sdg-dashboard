"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as React from "react";
import { Data, Layout } from "plotly.js";
import { Goal, GoalSummary } from '@/types/dashboard.types';
import { useGoalData } from '@/hooks/useGaugeData';
import { useRetry } from '@/hooks/useRetry';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

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
  valueType?: 'avg_value'; // 'latest_value' | 'avg_value' | 'median_value'
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
  // Use the custom hook with retry logic
  const { executeWithRetry, retryCount, isRetrying, canRetry, reset: resetRetry } = useRetry({
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 1.5
  });

  // Use the goal data hook
  const { 
    goalData, 
    allGoalsData,
    isLoading, 
    error, 
    hasData, 
    message,
    refetch,
    retry 
  } = useGoalData({
    goal_id,
    year,
    month,
    project_id,
    location,
    enabled: true
  });

  const handleOnClick = () => {
    if (onFilterChange && goal_id !== undefined) {
      if (isActive) {
        onFilterChange(null);
      } else {
        onFilterChange(goal_id);
      }
    }
  };

  const handleRetry = async () => {
    try {
      resetRetry();
      await executeWithRetry(
        () => retry(),
        (attempt) => console.log(`Retry attempt ${attempt} for goal ${goal_id}`)
      );
    } catch (err) {
      console.error('All retry attempts failed:', err);
    }
  };

  const getGaugeColor = (percentage: number) => {
    if (percentage < 50) return "#E5243B"; // Red (0-49%)
    if (percentage < 80) return "#FF9800"; // Orange (50-79%)
    return "#4CAF50"; // Green (80-100%)
  };
  
  // Display value to show on gauge
  const displayValue = hasData && goalData ? goalData[valueType] : defaultValue;
  const normalizedValue = Math.min(Math.max(displayValue, 0), 100);
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

  // Loading state
  if (isLoading || isRetrying) {
    return (
      <div className="w-full h-32 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
        <div className="text-xs text-gray-500">
          {isRetrying ? `Retrying... (${retryCount}/${3})` : 'Loading...'}
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="w-full h-32 flex flex-col items-center justify-center p-2 bg-red-50 rounded">
        <div className="text-red-600 text-xs text-center mb-2">
          {error}
        </div>
        {canRetry && (
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            Retry ({retryCount}/{3})
          </button>
        )}
        <button
          onClick={refetch}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors mt-1"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={handleOnClick} 
      style={{ 
        cursor: onFilterChange ? "pointer" : "default",
        opacity: isActive ? 1 : hasData ? 0.9 : 0.7,
        border: isActive ? `2px solid ${gaugeColor}` : 'none',
        borderRadius: '8px',
        padding: '4px'
      }}
      className="transition-all duration-200 hover:opacity-100 hover:shadow-md"
    >
      <Plot data={data} layout={layout} config={{ displayModeBar: false }} />
      
      {/* Status indicators */}
      {!hasData && !error && (
        <div className="text-xs text-center mt-1 text-gray-500">
          {message || "No data available"}
        </div>
      )}
      
      {isActive && hasData && (
        <div className="text-xs text-center mt-1 font-medium" style={{ color: gaugeColor }}>
          Selected
        </div>
      )}
      
      {/* Debug info */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1">
          Goal: {goal_id} | Retries: {retryCount}
        </div>
      )} */}
    </div>
  );
};

export default GaugeChart;