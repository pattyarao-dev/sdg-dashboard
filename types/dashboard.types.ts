export interface DashboardRequiredData {
  requiredDataId: number;
  requiredDataName: string;
}

export interface DashboardComputationRule {
  ruleId: number;
  ruleFormula: string;
}

export interface DashboardSubIndicator {
  goalSubIndicatorId: number;
  subIndicatorId: number;
  subIndicatorName: string;
  requiredData: DashboardRequiredData[];
  subIndicatorComputationRule: DashboardComputationRule[];
}

export interface DashboardIndicator {
  goalIndicatorId: number;
  indicatorId: number;
  indicatorName: string;
  requiredData: DashboardRequiredData[];
  subIndicators: DashboardSubIndicator[];
  computationRule: DashboardComputationRule[];
}

export interface DashboardProcessedGoal {
  goalId: number;
  goalName: string;
  indicators: DashboardIndicator[];
}

export interface DashboardProcessedGoals extends Array<DashboardProcessedGoal> { }


export interface DashboardRequiredDataRef {
  required_data_id: number;
  name: string;
}

export interface DashboardGoalIndicatorRequiredData {
  ref_required_data: DashboardRequiredDataRef;
}

export interface DashboardSubIndicatorHierarchy {
  indicator_id: number;
  name: string;
  description: string | null;
  status: string;
  required_data: any[];
  sub_indicators: DashboardSubIndicatorHierarchy[];
}

export interface DashboardMdIndicator {
  indicator_id: number;
  name: string;
  description?: string | null;
  status?: string;
}

export interface DashboardMdSubIndicator {
  sub_indicator_id: number;
  name: string;
  description?: string | null;
  status?: string;
  parent_indicator_id?: number | null;
  parent_sub_indicator_id?: number | null;
}

export interface DashboardGoalSubIndicator {
  goal_sub_indicator_id?: number;                                              // Add this
  global_target_value?: number | null;                                        // Add this  
  global_baseline_value?: number | null;                                      // Add this
  baseline_year?: number;                                                      // Add this
  md_sub_indicator: DashboardMdSubIndicator;
  td_goal_sub_indicator_required_data?: DashboardGoalSubIndicatorRequiredData[]; // Add this
}

export interface DashboardAvailableIndicator {
  goal_indicator_id: number;
  goal_id: number;
  md_indicator: DashboardMdIndicator;
  td_goal_sub_indicator: DashboardGoalSubIndicator[];
  td_goal_indicator_required_data: DashboardGoalIndicatorRequiredData[];
}

export interface DashboardGetAvailableIndicatorsResponse {
  availableIndicators: DashboardAvailableIndicator[];
  getCompleteSubIndicatorHierarchy: (indicatorId: number) => Promise<DashboardSubIndicatorHierarchy[]>;
}

export interface DashboardMdIndicatorWithHierarchy extends DashboardMdIndicator {
  sub_indicators?: DashboardSubIndicatorHierarchy[];
}

export interface DashboardAvailableIndicatorWithHierarchy {
  goal_indicator_id: number;
  goal_id: number;
  indicator_id: number;                    // Added
  global_target_value: number | null;     // Added
  global_baseline_value: number | null;   // Added
  baseline_year: number;                   // Added
  md_indicator: DashboardMdIndicatorWithHierarchy;
  td_goal_sub_indicator: DashboardGoalSubIndicator[];
  td_goal_indicator_required_data: DashboardGoalIndicatorRequiredData[];
}

// types.ts
export interface IndicatorProgress {
  projectIndicatorId: number;
  indicatorName: string;
  targetValue: number;
  calculatedValue: number;
  progressPercentage: number;
}

export interface LocationData {
  [location: string]: IndicatorProgress[];
}

export interface TimeSeriesData {
  [year: string]: IndicatorProgress[];
}

export interface Filters {
  selectedLocations: string[];
  selectedIndicators: string[];
  selectedYears: string[];
  progressRange: { min: number; max: number };
  targetAchievement: "all" | "above" | "ontrack" | "behind";
  showCompleteDataOnly: boolean;
}

export interface DashboardGoalSubIndicatorRequiredData {
  ref_required_data: DashboardRequiredDataRef;
}
