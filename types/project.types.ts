export interface IProject {
  project_id: number;
  name: string;
  description: string | null;
  project_status: string;
  start_date: Date | null;
  end_date: Date | null;
}

export interface ILocation {
  location_id: number;
  name: string;
}

export interface IProjectProgressForm {
  projectId: number;
  name: string;
  description: string | null;
  project_location_id?: number;
  status: string | null;
  startDate: Date | null;
  endDate: Date | null;
  projectIndicators: IProjectIndicator[];
}

export interface IProjectIndicator {
  projectIndicatorId: number;
  goalIndicatorId: number | null;
  indicatorName: string | null;
  projectSubIndicators: IProjectSubIndicator[];
  requiredData: IProjectRequiredData[];
  computationRule: IProjectComputationRule[];
  project_location_id?: number;
}

export interface IProjectSubIndicator {
  projectSubIndicatorId: number;
  goalSubIndicatorId?: number;
  subIndicatorName: string;
  requiredData?: IProjectRequiredData[];
  computationRule?: IProjectComputationRule[];
}

export interface IProjectRequiredData {
  requiredDataId: number;
  requiredDataName: string;
}

export interface IProjectComputationRule {
  ruleId: number;
  ruleFormula: string;
}
