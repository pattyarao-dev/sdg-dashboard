import ProgressFormComponent from "@/components/ProgressFormComponent";
import { getGoalsInformation } from "@/app/actions/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

interface RequiredData {
  requiredDataId: number;
  requiredDataName: string;
  requiredDataValue?: number; // Make this optional
}

interface ComputationRule {
  ruleId: number;
  ruleFormula: string;
}

interface SubIndicator {
  goalSubIndicatorId: number;
  subIndicatorId: number;
  subIndicatorName: string;
  requiredData: RequiredData[];
  subIndicatorComputationRule: ComputationRule[];
}

interface Indicator {
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

export default async function ProgressForm() {
  const processedGoals = await getGoalsInformation();
  const session = await getServerSession(authOptions);

  return (
    <main className="w-full min-h-screen p-10 flex flex-col items-center ">
      <ProgressFormComponent
        session={session}
        goals={processedGoals as Goal[]}
      />
    </main>
  );
}
