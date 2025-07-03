"use client";

import EditIndicatorValues from "./EditIndicatorValues";

interface RequiredData {
  requiredDataId: number;
  requiredDataName: string;
  requiredDataValue?: number; // Make this optional
}
interface ComputationRule {
  ruleId: number;
  ruleFormula: string;
  includeSubIndicator?: boolean
}

export interface SubIndicator {
  goalSubIndicatorId: number;
  subIndicatorId: number;
  subIndicatorName: string;
  requiredData: RequiredData[];
  subIndicatorComputationRule: ComputationRule[];
}

export interface Indicator {
  goalIndicatorId: number;
  indicatorId: number;
  indicatorName: string;
  subIndicators: SubIndicator[];
  requiredData: RequiredData[];
  computationRule: ComputationRule[];
}

interface Goal {
  goalId: number;
  goalName: string;
  indicators: Indicator[];
}

interface ProgressFormProps {
  goals: Goal[];
}

const ProgressFormComponent = ({ goals }: ProgressFormProps) => {
  return (
    <div className="w-full flex flex-col gap-24">
      {goals.map((goal) => (
        <div key={goal.goalId} className="w-full flex flex-col gap-6 border-b">
          <div className="w-full p-6 flex flex-col gap-1 bg-gradient-to-br from-green-50 to-orange-50 rounded-md drop-shadow ">
            <p className="text-gray-600 text-4xl font-bold uppercase">
              {goal.goalName}
            </p>
            <p className="text-sm text-gray-500 italic">
              SDG Goal # {goal.goalId}
            </p>
          </div>

          <div className="w-full flex flex-col gap-10">
            {goal.indicators.map((indicator) => (
              <EditIndicatorValues
                indicator={indicator}
                key={indicator.indicatorId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressFormComponent;
