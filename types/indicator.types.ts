export interface IIndicator {
  indicator_id: number;
  name: string;
  global_target_value: number;
  global_baseline_value: number;
  description?: string | null;
  required_data: IRequiredData[];
  md_sub_indicator?: ISubIndicator[];
}

export interface IGoal {
  goal_id: number;
  name: string;
}

export interface ISubIndicator {
  sub_indicator_id: number;
  name: string;
  global_target_value: number;
  global_baseline_value: number;
  description?: string | null;
  //subIndicator_required_data: IRequiredData[];
}

export interface IRequiredData {
  required_data_id: number;
  name: string;
}

export interface IIndicatorGoal extends IIndicator {
  status: string;
}

export interface IGoalIndicator {
  goal_indicator_id: number;
  indicator: IIndicatorGoal;
}

export interface IGoalProjectIndicator {
  goal_id: number;
  goal_indicator: IGoalIndicator;
}

// For a single indicator record
export interface IGoalIndicatorSimple {
  goal_indicator_id: number;
  indicator_name: string;
  indicator_target: number | null;
}

// For a goal with its associated indicators
export interface IGoalWithIndicators {
  goal_id: number;
  name: string;
  indicators: IGoalIndicatorSimple[];
}
