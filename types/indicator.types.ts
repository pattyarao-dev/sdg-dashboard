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
  //subindicator_required_data: IRequiredData[];
}

export interface IRequiredData {
  required_data_id: number;
  name: string;
}
