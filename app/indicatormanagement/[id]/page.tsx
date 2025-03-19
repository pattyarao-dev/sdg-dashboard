import { getGoal, getRequiredDataList } from "@/app/actions/actions";
import { getAvailableIndicators } from "@/app/actions/actions_indicatormanagement";
import AddIndicator from "@/components/AddIndicator";
import GoBackButton from "@/components/GoBackButton";
import IndicatorManagementComponent from "@/components/indicatormanagement/IndicatorManagementComponent";
import prisma from "@/utils/prisma";

export default async function AddGoalIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  const goal = await getGoal(id);
  const requiredData = await getRequiredDataList();
  const availableIndicators = await getAvailableIndicators(id);

  return (
    <div className="w-full min-h-screen p-10 flex flex-col items-start justify-start gap-10">
      <GoBackButton />
      {/* <AddIndicator
        goalName={goal?.name}
        goalId={id}
        indicators={availableIndicators}
        requiredData={requiredData}
      /> */}
      <IndicatorManagementComponent
        goal={goal}
        requiredData={requiredData}
        availableIndicators={availableIndicators}
      />
    </div>
  );
}
