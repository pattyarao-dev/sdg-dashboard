import { getGoalsInformation } from "@/app/actions/actions";
import EditIndicatorComputationRule from "@/components/EditIndicatorComputationRule";
import { Indicator } from "@/types/indicator.types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function ComputationRules() {
  const goals = await getGoalsInformation();
  const user = await getServerSession(authOptions);
  const userRole = (user?.user as any)?.userTypeId;

  return (
    <>
      {userRole === 1 || userRole === 2 || userRole === 4 ? (
        <main className="w-full min-h-screen p-10 flex flex-col gap-10">
          <div className="w-full flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Identify Computation Rules for Goal-Indicators.
            </h1>
            <hr className="w-full" />
          </div>
          <div className="w-full flex flex-col gap-10">
            {goals.map((goal) => (
              <div key={goal.goalId} className="w-full flex flex-col gap-10">
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
                    <EditIndicatorComputationRule
                      indicator={indicator as Indicator}
                      key={indicator.goalIndicatorId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center">
          <h1>You are not authorized to view this page.</h1>
        </div>
      )}
    </>
  );
}
