import Link from "next/link";
import { getGoalsInformation } from "../actions/actions";

export default async function IndicatorManagement() {
  //const goals = await getGoals();
  const goals = await getGoalsInformation();
  return (
    <div className="w-full min-h-screen p-10 flex items-center justify-center bg-green-50">
      {/* <div className="w-full h-full p-10 flex flex-col gap-10">
        <h1 className="w-full font-black text-4xl uppercase">
          Sustainable Development Goals
        </h1>

        <div className="w-full flex flex-col gap-16">
          {goalsList.map((goal, index) => (
            <div
              key={goal.goal_id}
              className={`w-full p-4 ${index % 2 ? "bg-gray-100" : "bg-gray-300"} flex flex-col gap-6 rounded-xl`}
            >
              <div>
                <p className="w-full text-2xl font-bold">
                  <span>{goal.goal_id}. </span>
                  {goal.name}
                </p>
                <p className="w-full text-sm italic text-gray-600">
                  {goal.description}
                </p>
              </div>
              <div className="w-full flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <p className="w-full font-semibold">Indicators:</p>
                  <div className="w-full flex flex-col gap-2">
                    {goal.td_goal_indicator.map(({ md_indicator }, index) => (
                      <p
                        key={md_indicator.indicator_id}
                        className={`${index % 2 == 0 ? "bg-white" : ""} p-2 rounded-md`}
                      >
                        {md_indicator.name}
                      </p>
                    ))}
                  </div>
                </div>
                <button className="w-fit px-2 py-1 flex items-center justify-center gap-1 bg-blue-100 rounded-lg">
                  <IoAddSharp className="text-sm" />
                  <Link
                    href={`/indicatormanagement/${goal.goal_id}`}
                    className="text-sm"
                  >
                    Add Indicator
                  </Link>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      <div className="w-full flex flex-col gap-24">
        {goals.map((goal, index) => (
          <div
            key={index}
            className="w-full p-10 flex flex-col gap-8 bg-white drop-shadow-lg"
          >
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex items-center justify-between">
                <div className="w-fit flex flex-col items-start gap-1">
                  <p className="text-base font-black">Goal {goal.goalId}.</p>
                  <h1 className="text-3xl uppercase font-black text-green-800">
                    {goal.goalName}
                  </h1>
                </div>
                <button className="w-fit px-6 py-2 bg-gradient-to-r from-green-100 to-orange-200 font-bold uppercase">
                  <Link href={`/indicatormanagement/${goal.goalId}`}>
                    Add Goal Indicators
                  </Link>
                </button>
              </div>
              <hr className="w-full border border-gray-600" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <h1 className="font-bold uppercase text-green-800">Indicators</h1>
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
  );
}
