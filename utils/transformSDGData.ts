import { Indicator, Goal, GoalIndicator, IndicatorValue, SubIndicatorValue, GoalSubIndicator } from "./fetchData";

export interface DashboardSDG {
  goal_id: number;
  title: string;
  global_target_value: number;
  global_current_value: { year: number; current: number }[];
  indicators: {
    name: string;
    current: number[];
    target: number | number[];
    sub_indicators?: {
      name: string;
      current: number[];
      target: number | number[];
    }[];
  }[];
}

export const transformSDGData = (apiData: { indicators: Indicator[]; goals: Goal[] }): DashboardSDG[] => {
  return apiData.goals.map(goal => {
    const goalIndicators = goal.td_goal_indicator || [];

    return {
      goal_id: goal.goal_id,
      title: goal.name,
      global_target_value: calculateGoalTargetValue(goalIndicators),
      global_current_value: extractYearlyGoalValues(goalIndicators),
      indicators: goalIndicators.map(gi => {
        const indicator = apiData.indicators.find(ind => ind.indicator_id === gi.indicator_id);
        
        if (!indicator) return null;
        
        return {
          name: indicator.name,
          current: extractYearlyIndicatorValues(gi.td_indicator_value || []),
          target: gi.global_target_value || 0,
          sub_indicators: extractSubIndicators(indicator, gi)
        };
      }).filter(Boolean)
    };
  });
};

// Helper functions

function calculateGoalTargetValue(goalIndicators: GoalIndicator[]): number {
  const targetValues = goalIndicators.map(gi => gi.global_target_value).filter(Boolean) as number[];
  return targetValues.length > 0 ? targetValues.reduce((sum, val) => sum + val, 0) / targetValues.length : 0;
}

function extractYearlyGoalValues(goalIndicators: GoalIndicator[]): { year: number; current: number }[] {
  const allValues: { year: number; value: number }[] = [];

  goalIndicators.forEach(gi => {
    (gi.td_indicator_value || []).forEach(val => {
      const year = new Date(val.measurement_date).getFullYear();
      allValues.push({ year, value: val.value });
    });
  });

  const yearMap = new Map<number, number[]>();
  allValues.forEach(({ year, value }) => {
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)?.push(value);
  });

  return Array.from(yearMap.entries()).map(([year, values]) => ({
    year,
    current: values.reduce((sum, val) => sum + val, 0) / values.length
  })).sort((a, b) => a.year - b.year);
}

function extractYearlyIndicatorValues(indicatorValues: IndicatorValue[]): number[] {
  const yearMap = new Map<number, number[]>();
  
  indicatorValues.forEach(val => {
    const year = new Date(val.measurement_date).getFullYear();
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)?.push(val.value);
  });

  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  return years.map(year => {
    const values = yearMap.get(year) || [];
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  });
}

function extractSubIndicators(indicator: Indicator, goalIndicator: GoalIndicator) {
  return (indicator.md_sub_indicator || []).map(subInd => {
    const goalSubInd = subInd.td_goal_sub_indicator.find(gsi => gsi.goal_indicator_id === goalIndicator.goal_indicator_id);
    
    if (!goalSubInd) return null;
    
    return {
      name: subInd.name,
      current: extractYearlySubIndicatorValues(goalSubInd.td_sub_indicator_value || []),
      target: goalSubInd.global_target_value || 0
    };
  }).filter(Boolean);
}

function extractYearlySubIndicatorValues(subIndicatorValues: SubIndicatorValue[]): number[] {
  const yearMap = new Map<number, number[]>();

  subIndicatorValues.forEach(val => {
    const year = new Date(val.measurement_date).getFullYear();
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)?.push(val.value);
  });

  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  return years.map(year => {
    const values = yearMap.get(year) || [];
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  });
}
