import { getProjects, getGoals, getGoalsInformation } from "@/app/actions/actions";

export interface DashboardSDG {
  goal_id: number;
  title: string;
  global_current_value: { date: string; current: number }[];
  indicators: {
    name: string;
    description?: string | null; // Allow null
    current: {
      current?: number; 
      date: string; 
      value?: number;
    }[];
    target: number | number[];
    achievement_percentage: number;
    sub_indicators?: {
      name: string;
      description?: string | null; // Allow null
      current: { date: string; value: number }[];
      target: number | number[];
      achievement_percentage: number;
    }[];
  }[];
}

// For metrics calculation and dashboard display
export interface SummaryMetrics {
  totalIndicators: number;
  totalSubIndicators: number;
  onTrackIndicators: number;
  atRiskIndicators: number;
  avgYoyGrowth: string;
  mostImprovedIndicator: {
    name: string;
    improvement: number;
    goalTitle: string;
  };
  leastImprovedIndicator: {
    name: string;
    improvement: number;
    goalTitle: string;
  };
  overallProgress: number;
}

interface TemporalValue {
  date: string;
  value?: number;
  current?: number;
}

interface SubIndicator {
  name: string;
  description: string | null;
  current: TemporalValue[];
  target: number;
  achievement_percentage: number;
}

interface Indicator {
  name: string;
  description: string | null;
  current: TemporalValue[];
  target: number;
  achievement_percentage: number;
  sub_indicators?: SubIndicator[];
}

interface SDGGoal {
  goal_id: number;
  title: string;
  global_current_value: TemporalValue[];
  indicators: Indicator[];
}

// For your function parameters
interface RawIndicatorValue {
  value: number;
  measurement_date: Date | string;
  value_id?: number;
  location?: string | null;
  notes?: string | null;
  created_by?: number;
  goal_indicator_id?: number | null;
  project_indicator_id?: number | null;
  goal_sub_indicator_id?: number | null;
  project_sub_indicator_id?: number | null;
}

// Create a cache for expensive operations
const dataCache = {
  sdgData: null as DashboardSDG[] | null,
  dateMap: new Map<string, Date>(),
};

// Helper function to get or create cached Date objects
const getCachedDate = (dateString: string): Date => {
  if (!dataCache.dateMap.has(dateString)) {
    dataCache.dateMap.set(dateString, new Date(dateString));
  }
  return dataCache.dateMap.get(dateString)!;
};

// Optimized to handle both data structures more efficiently
export const getMostRecentValue = (data: TemporalValue[]): number => {
  if (!data || data.length === 0) return 0;
  
  // Use a single pass to find the most recent entry
  let mostRecent = data[0];
  let mostRecentTime = getCachedDate(data[0].date).getTime();
  
  for (let i = 1; i < data.length; i++) {
    const currentTime = getCachedDate(data[i].date).getTime();
    if (currentTime > mostRecentTime) {
      mostRecent = data[i];
      mostRecentTime = currentTime;
    }
  }
  
  // Return the value, handling both data structure types
  return mostRecent.value !== undefined ? mostRecent.value : (mostRecent.current || 0);
};

// Calculate overall progress for a single goal - optimized for speed
export function calculateOverallProgress(goalData: DashboardSDG): number {
  const indicators = goalData.indicators;
  if (!indicators.length) return 0;
  
  let totalAchievement = 0;
  for (let i = 0; i < indicators.length; i++) {
    totalAchievement += indicators[i].achievement_percentage;
  }
  
  return Math.round(totalAchievement / indicators.length);
}

// Calculate overall progress across multiple goals - optimized for speed
export function calculateOverallProgressAcrossGoals(goalsData: DashboardSDG[]): number {
  if (!goalsData.length) return 0;
  
  let totalAchievement = 0;
  let indicatorCount = 0;
  
  for (const goal of goalsData) {
    for (const indicator of goal.indicators) {
      totalAchievement += indicator.achievement_percentage;
      indicatorCount++;
    }
  }
  
  return indicatorCount > 0 ? Math.round(totalAchievement / indicatorCount) : 0;
}

// Optimized helper function to calculate achievement percentage with bounds
function calculateAchievementPercentage(current: number, target: number): number {
  if (!target) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100); // Clamp between 0-100 and round
}

// Calculate summary metrics for scorecards - optimized for performance
export const calculateSummaryMetrics = (allData: DashboardSDG[], selectedGoal: DashboardSDG | null): SummaryMetrics => {
  // If a goal is selected, use its data; otherwise, aggregate data from all goals
  const dataToProcess = selectedGoal ? [selectedGoal] : allData;
  
  let totalIndicators = 0;
  let totalSubIndicators = 0;
  let onTrackIndicators = 0;
  let atRiskIndicators = 0;
  let avgYoyGrowth = 0;
  let indicatorsWithGrowth = 0;
  
  // Initialize with defaults to avoid null checks later
  let mostImprovedIndicator = { name: "N/A", improvement: 0, goalTitle: "N/A" };
  let leastImprovedIndicator = { name: "N/A", improvement: Infinity, goalTitle: "N/A" };
  
  // Process all indicators in a single pass
  for (const goal of dataToProcess) {
    for (const indicator of goal.indicators) {
      totalIndicators++;
      
      if (indicator.sub_indicators) {
        totalSubIndicators += indicator.sub_indicators.length;
      }
      
      if (indicator.achievement_percentage >= 75) {
        onTrackIndicators++;
      }
      
      if (indicator.achievement_percentage < 50) {
        atRiskIndicators++;
      }
      
      // Calculate growth only if there are at least 2 values
      if (indicator.current.length >= 2) {
        // Sort current values by date - using a more efficient approach
        const sortedValues = [...indicator.current];
        sortedValues.sort((a, b) => a.date.localeCompare(b.date));
        
        const oldestValue = sortedValues[0].value !== undefined ? sortedValues[0].value : (sortedValues[0].current || 0);
        const latestValue = sortedValues[sortedValues.length - 1].value !== undefined 
          ? sortedValues[sortedValues.length - 1].value 
          : (sortedValues[sortedValues.length - 1].current || 0);
        
        if (oldestValue > 0) {
          const improvement = ((latestValue - oldestValue) / oldestValue) * 100;
          avgYoyGrowth += improvement;
          indicatorsWithGrowth++;
          
          // Track most/least improved
          if (improvement > mostImprovedIndicator.improvement) {
            mostImprovedIndicator = { 
              name: indicator.name, 
              improvement,
              goalTitle: goal.title
            };
          }
          
          if (improvement < leastImprovedIndicator.improvement) {
            leastImprovedIndicator = { 
              name: indicator.name, 
              improvement,
              goalTitle: goal.title
            };
          }
        }
      }
    }
  }
  
  // Replace Infinity with 0 if no improvements were found
  if (leastImprovedIndicator.improvement === Infinity) {
    leastImprovedIndicator.improvement = 0;
  }
  
  // Calculate average growth
  const calculatedAvgYoyGrowth = indicatorsWithGrowth > 0 ? avgYoyGrowth / indicatorsWithGrowth : 0;
  
  // Calculate overall progress efficiently
  const overallProgress = calculateOverallProgressAcrossGoals(dataToProcess);
  
  return {
    totalIndicators,
    totalSubIndicators,
    onTrackIndicators,
    atRiskIndicators,
    avgYoyGrowth: calculatedAvgYoyGrowth.toFixed(1),
    mostImprovedIndicator,
    leastImprovedIndicator,
    overallProgress
  };
};

// Get aggregate data for all indicators across all goals - optimized
export const getAllIndicatorsData = (sdgData: DashboardSDG[], sdgColors: { [key: string]: string }) => {
  const result = [];
  
  for (const goal of sdgData) {
    for (const indicator of goal.indicators) {
      result.push({
        ...indicator,
        goalId: goal.goal_id,
        goalTitle: goal.title,
        goalColor: sdgColors[goal.title] || "blue"
      });
    }
  }
  
  return result;
};

// Unified function to extract temporal values
function extractTemporalValues(values: RawIndicatorValue[]): TemporalValue[] {
  const result: TemporalValue[] = [];
  
  for (const val of values) {
    // Handle both Date objects and string dates
    const measurementDate = val.measurement_date instanceof Date 
      ? val.measurement_date 
      : new Date(val.measurement_date);
    
    const dateKey = `${measurementDate.getFullYear()}-${String(measurementDate.getMonth() + 1).padStart(2, '0')}`;
    
    result.push({
      date: dateKey,
      value: val.value
    });
  }
  
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// Optimized function to aggregate temporal values
function aggregateTemporalValues(items: any[], type: "goal" | "indicator"): { date: string; current: number }[] {
  const valuesMap = new Map<string, number[]>();

  for (const item of items) {
    const records = type === "goal" ? (item.td_indicator_value || []) : [item];
    
    for (const val of records) {
      if (val.measurement_date) {
        const measurementDate = val.measurement_date instanceof Date 
          ? val.measurement_date 
          : new Date(val.measurement_date);
          
        const dateKey = `${measurementDate.getFullYear()}-${String(measurementDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!valuesMap.has(dateKey)) {
          valuesMap.set(dateKey, []);
        }
        valuesMap.get(dateKey)!.push(val.value);
      }
    }
  }

  const result: { date: string; current: number }[] = [];
  
  valuesMap.forEach((values, dateKey) => {
    // Ensure we always have a value
    const average = values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
      
    result.push({ 
      date: dateKey, 
      current: average 
    });
  });
  
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// Main transformation function with optimizations
export const transformSDGData = async (): Promise<DashboardSDG[]> => {
  // Check cached data
  if (dataCache.sdgData) {
    return dataCache.sdgData;
  }
  
  const goals = await getGoals();
  const result: DashboardSDG[] = [];
  
  for (const goal of goals) {
    const goalIndicators = goal.td_goal_indicator || [];
    // Make sure global_current_value matches expected type
    const globalCurrentValue = aggregateTemporalValues(goalIndicators, "goal");

    const indicators = [];
    
    for (const gi of goalIndicators) {
      const indicator = gi.md_indicator;
      if (!indicator) continue;

      const indicatorValues = gi.td_indicator_value || [];
      // Convert to the expected format
      const current = extractTemporalValues(indicatorValues).map(item => ({
        date: item.date,
        current: item.value,
        value: item.value
      }));
      
      const target = gi.global_target_value || 0;
      const latestValue = getMostRecentValue(current);
      const achievement_percentage = calculateAchievementPercentage(latestValue, target);

      const sub_indicators = [];
      
      if (gi.td_goal_sub_indicator && gi.td_goal_sub_indicator.length > 0) {
        for (const gsi of gi.td_goal_sub_indicator) {
          const subInd = gsi.md_sub_indicator;
          if (!subInd) continue;
          
          const subIndValues = gsi.td_sub_indicator_value || [];
          // Ensure sub-indicator current values have the correct format
          const subCurrent = extractTemporalValues(subIndValues).map(item => ({
            date: item.date,
            value: item.value || 0 // Ensure value is defined
          }));
          
          const target = gsi.global_target_value || 0;
          const latestValue = getMostRecentValue(subCurrent);
          const achievement_percentage = calculateAchievementPercentage(latestValue, target);
          
          sub_indicators.push({
            name: subInd.name,
            description: subInd.description,
            current: subCurrent,
            target,
            achievement_percentage
          });
        }
      }

      indicators.push({
        name: indicator.name,
        description: indicator.description,
        current,
        target,
        achievement_percentage,
        sub_indicators: sub_indicators.length > 0 ? sub_indicators : undefined
      });
    }

    result.push({
      goal_id: goal.goal_id,
      title: goal.name,
      global_current_value: globalCurrentValue,
      indicators
    });
  }
  
  dataCache.sdgData = result;
  return result;
};