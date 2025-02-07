import Link from "next/link";
import { getGoals } from "../actions/actions";
import { IoAddSharp } from "react-icons/io5";

export default async function IndicatorManagement() {
  const goalsList = await getGoals();
  return (
    <div className="w-full min-h-screen p-10 flex items-center justify-center bg-green-50">
      <div className="w-full h-full p-10 flex flex-col gap-10">
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
      </div>
    </div>
  );
}
