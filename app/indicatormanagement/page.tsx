import Link from "next/link";
import { getGoals } from "../actions/actions";
import { IoAddSharp } from "react-icons/io5";

export default async function IndicatorManagement() {
  const goalsList = await getGoals();
  return (
    <div className="w-full min-h-screen p-10 flex items-center justify-center">
      <div className="w-full h-full p-10 flex flex-col gap-10">
        <h1 className="w-full font-black text-4xl uppercase">
          Sustainable Development Goals
        </h1>

        <div className="w-full flex flex-col gap-4">
          {goalsList.map((goal, index) => (
            <div
              key={goal.goal_id}
              className={`w-full p-4 ${index % 2 ? "" : "bg-neutral-300"} flex flex-col gap-6 rounded-xl`}
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
                <div>
                  <p className="w-full font-semibold">Indicators:</p>
                  {goal.td_goal_indicator.map(({ md_indicator }) => (
                    <p key={md_indicator.indicator_id}>{md_indicator.name}</p>
                  ))}
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
