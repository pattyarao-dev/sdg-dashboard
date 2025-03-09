import { getProjects, getGoals, getGoalsInformation } from "@/app/actions/actions";

export interface DashboardSDG {
  goal_id: number;
  title: string;
  global_current_value: { date: string; current: number }[];
  indicators: {
    name: string;
    description?: string;
    current: { date: string; value: number }[];
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
  measurement_date: string;
  value: number;
}

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

function aggregateTemporalValues(items: RawIndicatorValue[], type: "goal" | "indicator"): TemporalValue[] {
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