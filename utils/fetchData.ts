// fetchData.ts
export interface Indicator {
  indicator_id: number;
  name: string;
  description?: string;
  td_goal_indicator: GoalIndicator[];
}

export interface GoalIndicator {
  goal_id: number;
  indicator_id: number;
  md_goal?: Goal;
  td_indicator_value?: IndicatorValue[];
}

export interface Goal {
  goal_id: number;
  name: string;
  description?: string;
}

export interface IndicatorValue {
  value_id: number;
  value: number;
  measurement_date: string;
  location?: string;
  notes?: string;
}

export interface FormattedGoal {
  goal_id: number;
  goal_name: string;
  indicators: {
    indicator_id: number;
    name: string;
    description?: string;
    values: IndicatorValue[];
  }[];
}

// Fetch function to get the data from API
export const fetchSDGData = async (): Promise<{ indicators: Indicator[] } | null> => {
  try {
    const response = await fetch("http://localhost:8000/extract-indicators");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: { indicators: Indicator[] } = await response.json();
    return data; // Return the fetched data
  } catch (error) {
    console.error("Error fetching SDG data:", error);
    return null;
  }
};
