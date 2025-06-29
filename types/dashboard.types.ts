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
  md_sub_indicator: DashboardMdSubIndicator;
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
