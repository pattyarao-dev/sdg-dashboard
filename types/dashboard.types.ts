export interface Goal {
  name: any;
  goal_id: number;
  goal_name: string;
  color?: string;
}

export interface GoalSummary {
    goal_id: number;
    goal_name: string;
    count: number;
    avg_value: number;
    median_value: number;
    min_value: number;
    max_value: number;
    std_dev: number;
    unique_values: number;
    latest_value: number;
    latest_measurement_date: string;
    project_avg_value?: number;
    project_median_value?: number;
    project_min_value?: number;
    project_max_value?: number;
    project_values_count?: number;
  }