import Link from "next/link";
import { getGoalsInformation } from "../actions/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function IndicatorManagement() {
  //const goals = await getGoals();
  const goals = await getGoalsInformation();
  const user = await getServerSession(authOptions);
  const userRole = (user?.user as any)?.userTypeId;

  console.log(user);
  console.log("this is the user type id: " + userRole);
  return (
    <>
      {userRole === 1 || userRole === 2 ? (
        <div className="w-full min-h-screen p-10 flex items-center justify-center bg-green-50">
          <div className="w-full flex flex-col gap-24">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="w-full p-10 flex flex-col gap-8 bg-white drop-shadow-lg"
              >
                <div className="w-full flex flex-col gap-4">
                  <div className="w-full flex items-center justify-between">
                    <div className="w-fit flex flex-col items-start gap-1">
                      <p className="text-base font-black">
                        Goal {goal.goalId}.
                      </p>
                      <h1 className="text-3xl uppercase font-black text-green-800">
                        {goal.goalName}
                      </h1>
                    </div>
                    <button className="w-fit px-6 py-2 border-2 border-green-800 text-green-800 font-bold uppercase">
                      <Link href={`/indicatormanagement/${goal.goalId}`}>
                        Manage Indicators
                      </Link>
                    </button>
                  </div>
                  <hr className="w-full border border-gray-600" />
                </div>
                <div className="w-full flex flex-col gap-2">
                  <h1 className="font-bold uppercase text-green-800">
                    Indicators
                  </h1>
                  {goal.indicators.length > 0 ? (
                    goal.indicators.map((indicator, index) => (
                      <div
                        key={index}
                        className="w-full p-4 border border-gray-300"
                      >
                        <h1>{indicator.indicatorName}</h1>
                      </div>
                    ))
                  ) : (
                    <div className="w-full p-4">
                      <h1 className="text-lg italic text-gray-500">
                        No indicators added
                      </h1>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full min-h-screen flex items-center justify-center">
          <h1>Sorry, you are not authorized to view this page.</h1>
        </div>
      )}
    </>
  );
}
