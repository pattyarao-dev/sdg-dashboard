import { getProjects, getGoals, getGoalsInformation } from "@/app/actions/actions";

export interface DashboardSDG {
  goal_id: number;
  title: string;
  global_current_value: { date: string; current: number }[];
  indicators: {
    name: string;
    description?: string;
    current: {
      current: any; date: string; value: number 
    }[];
    target: number | number[];
    achievement_percentage: number;
    sub_indicators?: {
      name: string;
      description?: string;
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
  value: number;
}

interface SubIndicator {
  name: string;
  description: string | null;
  current: TemporalValue[];
  target: number;
  achievement_percentage: number;
  subindicatorValues?: TemporalValue[];
}

interface Indicator {
  name: string;
  description: string | null;
  current: TemporalValue[];
  target: number;
  achievement_percentage: number;
  subindicators?: SubIndicator[];
}

interface SDGGoal {
  goal_id: number;
  title: string;
  global_current_value: TemporalValue[];
  indicators: Indicator[];
}

// For your function parameters
interface RawIndicatorValue {
  td_indicator_value: never[];
  measurement_date: string;
  value: number;
}

// Helper function to get the most recent value from date-based data
export const getMostRecentValue = (data: { date: string; value: number }[] | { date: string; current: number }[]): number => {
  if (!data || data.length === 0) return 0;
  
  // Sort by date descending to get the most recent first
  const sortedData = [...data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Return the value of the most recent entry
  // Handle both data structure types
  return 'value' in sortedData[0] ? sortedData[0].value : sortedData[0].current;
};

// Calculate overall progress for a single goal
export function calculateOverallProgress(goalData: DashboardSDG): number {
  if (!goalData.indicators.length) return 0;
  
  const totalAchievement = goalData.indicators.reduce(
    (sum, indicator) => sum + indicator.achievement_percentage, 
    0
  );
  
  return Math.round(totalAchievement / goalData.indicators.length);
}

// Calculate overall progress across multiple goals
export function calculateOverallProgressAcrossGoals(goalsData: DashboardSDG[]): number {
  if (!goalsData.length) return 0;
  
  const allIndicators = goalsData.flatMap(goal => goal.indicators);
  if (!allIndicators.length) return 0;
  
  const totalAchievement = allIndicators.reduce(
    (sum, indicator) => sum + indicator.achievement_percentage, 
    0
  );
  
  return Math.round(totalAchievement / allIndicators.length);
}

// Calculate summary metrics for scorecards (for all goals or selected goal)
export const calculateSummaryMetrics = (allData: DashboardSDG[], selectedGoal: DashboardSDG | null): SummaryMetrics => {
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

// Get aggregate data for all indicators across all goals
export const getAllIndicatorsData = (sdgData: DashboardSDG[], sdgColors: { [key: string]: string }) => {
  return sdgData.flatMap(goal => 
    goal.indicators.map(indicator => ({
      ...indicator,
      goalId: goal.goal_id,
      goalTitle: goal.title,
      goalColor: sdgColors[goal.title] || "blue"
    }))
  );
};

// Modified to use the actual structure of data returned by getGoals()
export const transformSDGData = async (): Promise<DashboardSDG[]> => {
  // Use the actual exported functions to get data
  const goals = await getGoals();
  
  return goals.map(goal => {
    const goalIndicators = goal.td_goal_indicator || [];
    const globalCurrentValue = aggregateTemporalValues(goalIndicators, "goal");

    const indicators = goalIndicators
      .map(gi => {
        const indicator = gi.md_indicator;
        if (!indicator) return null;

        const indicatorValues = gi.td_indicator_value || [];
        const current = extractTemporalIndicatorValues(indicatorValues);
        const target = gi.global_target_value || 0;
        
        // Get latest value for achievement calculation
        const latestValue = current.length > 0 
          ? current.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value 
          : 0;
          
        const achievement_percentage = calculateAchievementPercentage(latestValue, target);

        const sub_indicators = gi.td_goal_sub_indicator
          ?.map(gsi => {
            const subInd = gsi.md_sub_indicator;
            if (!subInd) return null;
            
            const subIndValues = gsi.td_sub_indicator_value || [];
            const current = extractTemporalSubIndicatorValues(subIndValues);
            const target = gsi.global_target_value || 0;
            
            // Get latest value for achievement calculation

            // TODO: value for achievement (inverse)
            const latestValue = current.length > 0 
              ? current.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value
              : 0;
              
            const achievement_percentage = calculateAchievementPercentage(latestValue, target);
            
            return {
              name: subInd.name,
              description: subInd.description,
              current,
              target,
              achievement_percentage
            };
          })
          .filter(Boolean);

        return {
          name: indicator.name,
          description: indicator.description,
          current,
          target,
          achievement_percentage,
          sub_indicators
        };
      })
      .filter(Boolean);

    return {
      goal_id: goal.goal_id,
      title: goal.name,
      global_current_value: globalCurrentValue,
      indicators
    };
  });
};

// Helper functions updated to preserve date granularity to month level

function calculateAchievementPercentage(current: number, target: number): number {
  if (!target) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
}

function aggregateTemporalValues(items: any[], type: "goal" | "indicator"): TemporalValue[] {
  const valuesMap = new Map<string, number[]>();

  items.forEach(item => {
    const records = type === "goal" ? (item.td_indicator_value || []) : [item];
    records.forEach((val: RawIndicatorValue) => {
      const measurementDate = new Date(val.measurement_date);
      // Format to YYYY-MM (year-month granularity)
      const dateKey = `${measurementDate.getFullYear()}-${String(measurementDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!valuesMap.has(dateKey)) valuesMap.set(dateKey, []);
      valuesMap.get(dateKey)?.push(val.value);
    });
  });

  return Array.from(valuesMap.entries())
    .map(([dateKey, values]) => ({
      date: dateKey,
      current: values.reduce((sum, val) => sum + val, 0) / values.length
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function extractTemporalIndicatorValues(indicatorValues: RawIndicatorValue[]): TemporalValue[] {
  return indicatorValues.map(val => {
    const measurementDate = new Date(val.measurement_date);
    // Format to YYYY-MM (year-month granularity)
    const dateKey = `${measurementDate.getFullYear()}-${String(measurementDate.getMonth() + 1).padStart(2, '0')}`;
    
    return {
      date: dateKey,
      value: val.value
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

function extractTemporalSubIndicatorValues(subIndicatorValues: RawIndicatorValue[]): TemporalValue[] {
  return subIndicatorValues.map(val => {
    const measurementDate = new Date(val.measurement_date);
    // Format to YYYY-MM (year-month granularity)
    const dateKey = `${measurementDate.getFullYear()}-${String(measurementDate.getMonth() + 1).padStart(2, '0')}`;
    
    return {
      date: dateKey,
      value: val.value
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}