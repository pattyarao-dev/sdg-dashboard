export interface Indicator {
  indicator_id: number;
  name: string;
  description?: string;
  status?: string;
  td_goal_indicator: GoalIndicator[];
  md_sub_indicator?: SubIndicator[]; 
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

export interface SubIndicator {
  sub_indicator_id: number;
  parent_indicator_id: number;
  name: string;
  description?: string;
  status?: string;
  md_indicator?: Indicator | null;
  td_goal_sub_indicator: GoalSubIndicator[];
}

export interface GoalSubIndicator {
  goal_sub_indicator_id: number;
  goal_indicator_id: number;
  sub_indicator_id: number;
  global_target_value?: number;
  global_baseline_value?: number;
  md_computation_rule?: ComputationRule[];
  td_goal_sub_indicator_required_data?: RequiredData[];
  td_required_data_value?: RequiredDataValue[];
  td_sub_indicator_value?: SubIndicatorValue[];
}

export interface ComputationRule {
  rule_id: number;
  goal_indicator_id?: number | null;
  goal_sub_indicator_id?: number;
  formula: string;
}

export interface RequiredData {
  goal_sub_indicator_required_data_id: number;
  goal_sub_indicator_id: number;
  required_data_id: number;
  ref_required_data: RequiredDataRef;
}

export interface RequiredDataRef {
  required_data_id: number;
  name: string;
}

export interface RequiredDataValue {
  value_id: number;
  required_data_id: number;
  goal_sub_indicator_id?: number | null;
  value: number;
  measurement_date: string;
  location?: string;
  notes?: string;
}
export interface SubIndicatorValue {
  value_id: number;
  goal_sub_indicator_id: number;
  sub_indicator_id: number;
  value: number;
  measurement_date: string;
  location?: string;
  notes?: string;
}
export const fetchSDGData = async (): Promise<{ indicators: Indicator[]; goals: Goal[] } | null> => {
  try {
    const response = await fetch("http://localhost:8000/extract-indicators");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: { indicators: Indicator[]; goals: Goal[] } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching SDG data:", error);
    return null;
  }
};

