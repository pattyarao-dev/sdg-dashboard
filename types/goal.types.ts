export interface Goal {
  goal_id: number;
  name: string;
  description?: string;
  indicators: Indicator[];
}

export interface Indicator {
  indicator_id: number;
  name: string;
  description?: string;
  global_target_value: number;
  global_baseline_value: number;
  required_data: RequiredData[];
  sub_indicators: Indicator[];
}

export interface RequiredData {
  required_data_id: number;
  name: string;
  newRD: boolean;
}

export interface SubIndicator {
  sub_indicator_id: number;
  name: string;
  description?: string;
}

export interface GoalSubIndicator {
  goal_sub_indicator_id: number;
  global_target_value: number;
  global_baseline_value: number;
  md_sub_indicator: SubIndicator;
}

// export interface Indicator {
//   indicator_id: number;
//   name: string;
//   description?: string;
//   status: string;
// }

// export interface RequiredData {
//   required_data_id: number;
//   name: string;
// }

export interface GoalIndicatorRequiredData {
  goal_indicator_required_data_id: number;
  ref_required_data: RequiredData;
}

export interface GoalIndicator {
  goal_indicator_id: number;
  md_indicator: Indicator;
  td_goal_sub_indicator?: GoalSubIndicator[];
  td_goal_indicator_required_data: GoalIndicatorRequiredData[];
}

// export interface Goal {
//   goal_id: number;
//   name: string;
//   description?: string;
//   td_goal_indicator: GoalIndicator[];
// }
