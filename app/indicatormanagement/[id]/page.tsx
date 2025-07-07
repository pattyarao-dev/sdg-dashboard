import { getGoal, getRequiredDataList } from "@/app/actions/actions";
import { getAvailableIndicators } from "@/app/actions/actions_indicatormanagement";
import GoBackButton from "@/components/GoBackButton";
import IndicatorManagementComponent from "@/components/indicatormanagement/IndicatorManagementComponent";
import { Goal, Indicator } from "@/types/goal.types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function AddGoalIndicator({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = Number((await params).id);
  const goal = await getGoal(id);
  const oldRequiredData = await getRequiredDataList();

  const user = await getServerSession(authOptions);
  const userRole = (user?.user as any)?.userTypeId;

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
    <>
      {userRole === 1 || userRole === 2 ? (
        <div className="w-full min-h-screen p-10 flex flex-col items-start justify-start gap-10">
          <GoBackButton />
          {/* <AddIndicator
            goalId={id}
            goalName={goal?.name}
            indicators={availableIndicators}
            requiredData={requiredData}
          /> */}
          <div className="w-full">
            {goal ? (
              <div className="w-full flex flex-col gap-2">
                <p className="text-3xl font-bold uppercase text-green-800">
                  {goal.goal_id}. {goal.name}
                </p>
                <hr className="w-full border-2 border-green-800" />
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <IndicatorManagementComponent
            goal={goal as unknown as Goal}
            requiredData={requiredData}
            availableIndicators={availableIndicators as unknown as Indicator[]}
          />
        </div>
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center">
          <h1>You are not authorized to access this page.</h1>
        </div>
      )}
    </>
  );
}
