import { getGoal, getRequiredDataList } from "@/app/actions/actions";
import {
  getAvailableIndicators,
  getAvailableIndicatorsNoSub,
} from "@/app/actions/actions_indicatormanagement";
import GoBackButton from "@/components/GoBackButton";
import IndicatorManagementComponent from "@/components/indicatormanagement/IndicatorManagementComponent";
import { Goal, Indicator } from "@/types/goal.types";

export default async function AddGoalIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  const goal = await getGoal(id);
  const oldRequiredData = await getRequiredDataList();
  //const availableIndicators = await getAvailableIndicatorsNoSub(id);
  const availableIndicators = await getAvailableIndicators(id);

  const requiredData = oldRequiredData.map((requiredData) => {
    return {
      required_data_id: requiredData.required_data_id,
      name: requiredData.name,
      newRD: false,
    };
  });

  return (
    <div className="w-full min-h-screen p-10 flex flex-col items-start justify-start gap-10">
      <GoBackButton />
      {/* <AddIndicator
        goalId={id}
        goalName={goal?.name}
        indicators={availableIndicators}
        requiredData={requiredData}
      /> */}
      <IndicatorManagementComponent
        goal={goal as unknown as Goal}
        requiredData={requiredData}
        availableIndicators={availableIndicators as unknown as Indicator[]}
      />
    </div>
  );
}
