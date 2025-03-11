import { getProjects, getGoals, getGoalsInformation } from "@/app/actions/actions";

export interface DashboardSDG {
  goal_id: number;
  title: string;
  global_current_value: { date: string; current: number }[];
  indicators: {
    name: string;
    description?: string | null;
    current: {
      current?: number; 
      date: string; 
      value?: number;
    }[];
    target: number | number[];
    achievement_percentage: number;
    latestValue: number; // Pre-computed latest value
    sub_indicators?: {
      name: string;
      description?: string | null;
      current: { date: string; value: number }[];
      target: number | number[];
      achievement_percentage: number;
      latestValue: number; // Pre-computed latest value
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

// Create a cache for expensive operations
const dataCache = {
  sdgData: null as DashboardSDG[] | null,
  dateMap: new Map<string, Date>(),
  summaryMetricsCache: new Map<string, SummaryMetrics>(),
  indicatorsDataCache: new Map<string, any[]>(),
  filteredDataCache: new Map<string, DashboardSDG[]>()
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

// Generate a cache key for filtered data
const getFilterCacheKey = (filters: any): string => {
  return JSON.stringify(filters);
};

// Filter SDG data based on criteria and use cache
export const filterSDGData = (
  allData: DashboardSDG[], 
  filters: any
): DashboardSDG[] => {
  const cacheKey = getFilterCacheKey(filters);
  
  // Check if we already have this result cached
  if (dataCache.filteredDataCache.has(cacheKey)) {
    return dataCache.filteredDataCache.get(cacheKey)!;
  }
  
  // If no filters are applied, return the original data
  if (!filters || Object.keys(filters).length === 0) {
    return allData;
  }
  
  // Perform the filtering
  const filteredData = allData.filter(goal => {
    // Apply goal-level filters
    if (filters.goalId && goal.goal_id !== filters.goalId) {
      return false;
    }
    
    // Create a new goal object with filtered indicators
    const filteredGoal = {
      ...goal,
      indicators: goal.indicators.filter(indicator => {
        // Apply indicator-level filters
        if (filters.indicatorName && !indicator.name.includes(filters.indicatorName)) {
          return false;
        }
        
        if (filters.minProgress && indicator.achievement_percentage < filters.minProgress) {
          return false;
        }
        
        if (filters.maxProgress && indicator.achievement_percentage > filters.maxProgress) {
          return false;
        }
        
        // More filters can be added here
        
        return true;
      })
    };
    
    // Only include goals that have at least one indicator after filtering
    return filteredGoal.indicators.length > 0;
  });
  
  // Cache the result
  dataCache.filteredDataCache.set(cacheKey, filteredData);
  
  return filteredData;
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

// Calculate overall progress across multiple goals with cache
export function calculateOverallProgressAcrossGoals(goalsData: DashboardSDG[]): number {
  if (!goalsData.length) return 0;
  
  // Create a cache key based on the goal IDs included
  const cacheKey = goalsData.map(g => g.goal_id).sort().join('-');
  
  // Check for cached calculation
  if (dataCache.summaryMetricsCache.has(`progress-${cacheKey}`)) {
    return (dataCache.summaryMetricsCache.get(`progress-${cacheKey}`) as any).overallProgress;
  }
  
  let totalAchievement = 0;
  let indicatorCount = 0;
  
  for (const goal of goalsData) {
    for (const indicator of goal.indicators) {
      totalAchievement += indicator.achievement_percentage;
      indicatorCount++;
    }
  }
  
  const result = indicatorCount > 0 ? Math.round(totalAchievement / indicatorCount) : 0;
  
  // Store in cache
  dataCache.summaryMetricsCache.set(`progress-${cacheKey}`, { overallProgress: result });
  
  return result;
}

// Optimized helper function to calculate achievement percentage with bounds
function calculateAchievementPercentage(current: number, target: number): number {
  if (!target) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100); // Clamp between 0-100 and round
}

// Calculate summary metrics with caching
export const calculateSummaryMetrics = (
  allData: DashboardSDG[], 
  selectedGoal: DashboardSDG | null,
  filters?: any
): SummaryMetrics => {
  // Create a cache key based on selected goal and filters
  const selectedGoalId = selectedGoal ? selectedGoal.goal_id : 'all';
  const filtersKey = filters ? JSON.stringify(filters) : 'none';
  const cacheKey = `metrics-${selectedGoalId}-${filtersKey}`;
  
  // Check if we have cached results
  if (dataCache.summaryMetricsCache.has(cacheKey)) {
    return dataCache.summaryMetricsCache.get(cacheKey)!;
  }
  
  // If filters are provided, use the filtered data
  const dataToProcess = filters 
    ? filterSDGData(selectedGoal ? [selectedGoal] : allData, filters)
    : (selectedGoal ? [selectedGoal] : allData);
  
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
        // Use pre-computed values when possible
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
  
  // Get overall progress (this might use a cached value)
  const overallProgress = calculateOverallProgressAcrossGoals(dataToProcess);
  
  const result = {
    totalIndicators,
    totalSubIndicators,
    onTrackIndicators,
    atRiskIndicators,
    avgYoyGrowth: calculatedAvgYoyGrowth.toFixed(1),
    mostImprovedIndicator,
    leastImprovedIndicator,
    overallProgress
  };
  
  // Cache the result
  dataCache.summaryMetricsCache.set(cacheKey, result);
  
  return result;
};

// Get aggregate data for all indicators with caching
export const getAllIndicatorsData = (
  sdgData: DashboardSDG[], 
  sdgColors: { [key: string]: string },
  filters?: any
) => {
  // Create cache key
  const filterKey = filters ? JSON.stringify(filters) : 'none';
  const cacheKey = `indicators-${filterKey}`;
  
  // Check cache first
  if (dataCache.indicatorsDataCache.has(cacheKey)) {
    return dataCache.indicatorsDataCache.get(cacheKey);
  }
  
  // Get filtered data if filters provided
  const dataToProcess = filters ? filterSDGData(sdgData, filters) : sdgData;
  
  const result = [];
  
  for (const goal of dataToProcess) {
    for (const indicator of goal.indicators) {
      result.push({
        ...indicator,
        goalId: goal.goal_id,
        goalTitle: goal.title,
        goalColor: sdgColors[goal.title] || "blue"
      });
    }
  }
  
  // Cache the result
  dataCache.indicatorsDataCache.set(cacheKey, result);
  
  return result;
};

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
            achievement_percentage,
            latestValue // Pre-compute and store this value
          });
        }
      }

      indicators.push({
        name: indicator.name,
        description: indicator.description,
        current,
        target,
        achievement_percentage,
        latestValue, // Pre-compute and store this value
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
  
  // Clear any existing caches when we load fresh data
  dataCache.filteredDataCache.clear();
  dataCache.summaryMetricsCache.clear();
  dataCache.indicatorsDataCache.clear();
  
  // Cache the full dataset
  dataCache.sdgData = result;
  return result;
};

// Unified function to extract temporal values
function extractTemporalValues(values: any[]): TemporalValue[] {
  const result: TemporalValue[] = [];
  
  for (const val of values) {
    // Handle both Date objects and string dates
    const measurementDate = val.measurement_date instanceof Date 
      ? val.measurement_date 
      : new Date(val.measurement_date);
    
    // Include day in the date key
    const dateKey = `${measurementDate.getFullYear()}-${
      String(measurementDate.getMonth() + 1).padStart(2, '0')
    }-${
      String(measurementDate.getDate()).padStart(2, '0')
    }`;
    
    result.push({
      date: dateKey,
      value: val.value
    });
  }
  
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// Update the aggregateTemporalValues function 
function aggregateTemporalValues(items: any[], type: "goal" | "indicator", includeDay: boolean = true): { date: string; current: number }[] {
  const valuesMap = new Map<string, number[]>();

  for (const item of items) {
    const records = type === "goal" ? (item.td_indicator_value || []) : [item];
    
    for (const val of records) {
      if (val.measurement_date) {
        const measurementDate = val.measurement_date instanceof Date 
          ? val.measurement_date 
          : new Date(val.measurement_date);
          
        const dateKey = includeDay 
          ? `${measurementDate.getFullYear()}-${
              String(measurementDate.getMonth() + 1).padStart(2, '0')
            }-${
              String(measurementDate.getDate()).padStart(2, '0')
            }`
          : `${measurementDate.getFullYear()}-${
              String(measurementDate.getMonth() + 1).padStart(2, '0')
            }`;
        
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

// Cache invalidation function - call when data changes
export const invalidateDataCache = () => {
  dataCache.sdgData = null;
  dataCache.filteredDataCache.clear();
  dataCache.summaryMetricsCache.clear();
  dataCache.indicatorsDataCache.clear();
};