export interface IIndicator {
  indicator_id: number;
  name: string;
  description?: string | null;
  md_sub_indicator?: ISubIndicator[];
}

export interface IGoal {
  goal_id: number;
  name: string;
}

export interface ISubIndicator {
  sub_indicator_id: number;
  name: string;
  description?: string | null;
}
