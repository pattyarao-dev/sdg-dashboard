export interface Goal {
  name: any;
  goal_id: number;
  goal_name: string;
  color?: string;
}
export interface GeoJSONFeature {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
    properties: {
      NAME_3: string;
      [key: string]: any;
    };
  }
export interface IndicatorValue {
    value_id: number;
    indicator_id: number;
    goal_id: number;
    value: number;
    measurement_date: string;
    location: string;
    goal_name: string;
    indicator_name: string;
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